import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Subscription from '#models/subscription'
import Transaction from '#models/transaction'
import AuditLog from '#models/audit_log'

/**
 * MonetizationController – scaffolding for data products, subscriptions and payments.
 *
 * This MVP provides:
 *   - CRUD for products (admin-only)
 *   - Subscription creation (placeholder, no actual payment charged)
 *   - Transaction listing (audit trail)
 *
 * A real payment gateway (e.g. Stripe / Paystack) would be integrated in a
 * follow-up PR and would replace the placeholder subscription logic.
 */
export default class MonetizationController {
  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------

  async listProducts({ request, response }: HttpContext) {
    const { type, active, page = 1, limit = 20 } = request.qs()
    const query = Product.query().orderBy('created_at', 'desc')
    if (type) query.where('product_type', type)
    if (active !== undefined) query.where('is_active', active === 'true')
    return response.ok(await query.paginate(Number(page), Number(limit)))
  }

  async storeProduct({ request, auth, response }: HttpContext) {
    const user = auth.user as any
    const body = request.body()

    const product = await Product.create({
      name: body.name,
      description: body.description ?? null,
      productType: body.product_type,
      priceUsd: Number(body.price_usd ?? 0),
      isActive: body.is_active !== false,
      metadata: body.metadata ?? null,
    })

    await AuditLog.create({
      userId: user?.id ? String(user.id) : null,
      tableName: 'products',
      recordId: product.id,
      action: 'INSERT',
      newValues: product.toJSON(),
      ipAddress: request.ip(),
      userAgent: request.header('user-agent') ?? null,
    })

    return response.created(product)
  }

  async showProduct({ params, response }: HttpContext) {
    return response.ok(await Product.findOrFail(params.id))
  }

  async updateProduct({ params, request, auth, response }: HttpContext) {
    const user = auth.user as any
    const product = await Product.findOrFail(params.id)
    const body = request.body()

    product.merge({
      name: body.name ?? product.name,
      description: body.description ?? product.description,
      priceUsd: body.price_usd !== undefined ? Number(body.price_usd) : product.priceUsd,
      isActive: body.is_active !== undefined ? body.is_active : product.isActive,
      metadata: body.metadata ?? product.metadata,
    })
    await product.save()

    await AuditLog.create({
      userId: user?.id ? String(user.id) : null,
      tableName: 'products',
      recordId: product.id,
      action: 'UPDATE',
      newValues: product.toJSON(),
      ipAddress: request.ip(),
      userAgent: request.header('user-agent') ?? null,
    })

    return response.ok(product)
  }

  // ---------------------------------------------------------------------------
  // Subscriptions
  // ---------------------------------------------------------------------------

  async listSubscriptions({ request, auth, response }: HttpContext) {
    const user = auth.user as any
    const { status, page = 1, limit = 20 } = request.qs()

    const query = Subscription.query().preload('product').orderBy('created_at', 'desc')

    if (user?.role !== 'admin') {
      query.where('user_id', String(user?.id ?? ''))
    }
    if (status) query.where('status', status)

    return response.ok(await query.paginate(Number(page), Number(limit)))
  }

  async storeSubscription({ request, auth, response }: HttpContext) {
    const user = auth.user as any
    const { product_id, return_url, cancel_url } = request.body()

    const product = await Product.findOrFail(product_id)

    if (!product.isActive) {
      return response.unprocessableEntity({ error: 'Product is not available for purchase' })
    }

    // Create subscription + transaction in pending state
    const sub = await Subscription.create({
      userId: String(user.id),
      productId: product.id,
      status: 'pending',
    })

    const txn = await Transaction.create({
      userId: String(user.id),
      productId: product.id,
      subscriptionId: sub.id,
      amountUsd: product.priceUsd,
      currency: 'ETB',
      status: 'pending',
      paymentProvider: 'chapa',
      paymentReference: null,
    })

    await AuditLog.create({
      userId: String(user.id),
      tableName: 'transactions',
      recordId: txn.id,
      action: 'PAYMENT',
      newValues: { amount: product.priceUsd, product: product.name, status: 'pending' },
      ipAddress: request.ip(),
      userAgent: request.header('user-agent') ?? null,
    })

    // ── Chapa payment initiation ─────────────────────────────────────────────
    const chapaKey = process.env.CHAPA_SECRET_KEY
    if (!chapaKey) {
      // Chapa not configured – return pending state for development
      return response.created({
        subscription: sub,
        transaction: txn,
        checkout_url: null,
        note: 'CHAPA_SECRET_KEY not configured. Set it in .env to enable live payments.',
      })
    }

    try {
      const txRef = `IADS-${txn.id}-${Date.now()}`

      const chapaRes = await fetch('https://api.chapa.co/v1/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${chapaKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: (product.priceUsd * 55).toFixed(2), // USD -> ETB approx
          currency: 'ETB',
          email: (user as any)?.email ?? 'user@iads.et',
          first_name: ((user as any)?.fullName ?? 'User').split(' ')[0],
          last_name: ((user as any)?.fullName ?? 'User').split(' ').slice(1).join(' ') || '-',
          tx_ref: txRef,
          callback_url: `${process.env.APP_URL}/api/v1/monetization/chapa/webhook`,
          return_url: return_url ?? `${process.env.FRONTEND_URL}/dashboard`,
          title: product.name,
          description: product.description ?? product.name,
        }),
      })

      const chapaData = (await chapaRes.json()) as any

      if (chapaData.status === 'success') {
        await txn.merge({ paymentReference: txRef }).save()
        return response.created({
          subscription: sub,
          transaction: txn,
          checkout_url: chapaData.data?.checkout_url ?? null,
          tx_ref: txRef,
        })
      } else {
        await txn.merge({ status: 'failed' }).save()
        return response.unprocessableEntity({
          error: 'Chapa payment initialization failed',
          details: chapaData.message ?? chapaData,
        })
      }
    } catch (err: any) {
      await txn.merge({ status: 'failed' }).save()
      return response.serviceUnavailable({
        error: 'Payment gateway unreachable',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      })
    }
  }

  /**
   * POST /api/v1/monetization/chapa/webhook
   * Chapa sends a POST callback here after payment completes.
   * Verifies the transaction and activates the subscription.
   */
  async chapaWebhook({ request, response }: HttpContext) {
    const { trx_ref, status } = request.body()

    if (!trx_ref) {
      return response.badRequest({ error: 'trx_ref is required' })
    }

    const txn = await Transaction.query().where('payment_reference', trx_ref).first()

    if (!txn) {
      return response.notFound({ error: 'Transaction not found' })
    }

    if (status === 'success') {
      await txn.merge({ status: 'completed' }).save()

      if (txn.subscriptionId) {
        const sub = await Subscription.find(txn.subscriptionId)
        if (sub) {
          const now = new Date()
          const expiresAt = new Date(now)
          expiresAt.setMonth(expiresAt.getMonth() + 1)
          await sub.merge({
            status: 'active',
            startedAt: now as any,
            expiresAt: expiresAt as any,
          }).save()
        }
      }

      await AuditLog.create({
        userId: txn.userId,
        tableName: 'transactions',
        recordId: txn.id,
        action: 'PAYMENT',
        newValues: { status: 'completed', trx_ref: trx_ref },
        ipAddress: request.ip(),
        userAgent: request.header('user-agent') ?? null,
      })
    } else {
      await txn.merge({ status: 'failed' }).save()
    }

    return response.ok({ received: true })
  }

  // ---------------------------------------------------------------------------
  // Transactions
  // ---------------------------------------------------------------------------

  async listTransactions({ request, auth, response }: HttpContext) {
    const user = auth.user as any
    const { status, page = 1, limit = 20 } = request.qs()

    const query = Transaction.query().orderBy('created_at', 'desc')

    if (user?.role !== 'admin') {
      query.where('user_id', String(user?.id ?? ''))
    }
    if (status) query.where('status', status)

    return response.ok(await query.paginate(Number(page), Number(limit)))
  }
}
