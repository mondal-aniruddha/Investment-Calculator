import { request } from '../../../shared/api/api'

export async function fetchArticles(category = '', query = '') {
  const params = new URLSearchParams()
  if (category && category !== 'ALL') params.set('category', category)
  if (query) params.set('query', query)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`/api/v1/learn/articles${qs}`)
}

export async function fetchArticleBySlug(slug) {
  return request(`/api/v1/learn/articles/${encodeURIComponent(slug)}`)
}
