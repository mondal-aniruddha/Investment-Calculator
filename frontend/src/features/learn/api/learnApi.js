/**
 * learnApi.js — API client methods for Learn Hub personal finance explainers.
 */
import { request } from '../../../shared/api/httpClient'
import { ENDPOINTS } from '../../../shared/api/endpoints'

/**
 * @typedef {Object} ArticleSummary
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} excerpt
 * @property {string} category
 * @property {number} readingTimeMinutes
 * @property {string|null} [relatedCalculatorPath]
 * @property {string|null} [relatedCalculatorLabel]
 * @property {string|null} [tags]
 * @property {string} updatedAt
 */

/**
 * Fetches articles filtered optionally by category and search keyword.
 *
 * @param {string} [category]
 * @param {string} [query]
 * @returns {Promise<ArticleSummary[]>}
 */
export async function fetchArticles(category = '', query = '') {
  const params = new URLSearchParams()
  if (category && category !== 'ALL') params.set('category', category)
  if (query) params.set('query', query)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`${ENDPOINTS.LEARN.ARTICLES}${qs}`)
}

/**
 * Fetches an article by unique slug identifier.
 *
 * @param {string} slug
 * @returns {Promise<any>}
 */
export async function fetchArticleBySlug(slug) {
  return request(`${ENDPOINTS.LEARN.ARTICLES}/${encodeURIComponent(slug)}`)
}
