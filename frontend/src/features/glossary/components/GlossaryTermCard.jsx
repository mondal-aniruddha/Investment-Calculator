import { Link } from 'react-router-dom'

/**
 * GlossaryTermCard — renders a single financial glossary term.
 *
 * @param {{
 *   term: {
 *     id?: string,
 *     term: string,
 *     shortDefinition: string,
 *     detailedExplainer?: string,
 *     category?: string,
 *     relatedUrl?: string,
 *   },
 *   highlighted?: boolean,
 *   cardRef?: React.Ref<HTMLElement>,
 * }} props
 */
export function GlossaryTermCard({ term: item, highlighted = false, cardRef = null }) {
  const termSlug = item.term.replace(/\s+/g, '-').toLowerCase()

  return (
    <article
      id={`glossary-term-${termSlug}`}
      ref={cardRef}
      tabIndex={highlighted ? -1 : undefined}
      className={`card glossary-term-card hover-lift${highlighted ? ' glossary-term-highlighted' : ''}`}
      aria-label={`Definition of ${item.term}`}
    >
      <div className="glossary-card-top">
        <h2 className="glossary-term-name">{item.term}</h2>
        {item.category && <span className="category-badge">{item.category}</span>}
      </div>

      <p className="glossary-short-def">{item.shortDefinition}</p>

      {item.detailedExplainer && (
        <p className="glossary-detailed-exp">{item.detailedExplainer}</p>
      )}

      {item.relatedUrl && (
        <div className="glossary-term-action">
          <Link to={item.relatedUrl} className="related-calc-btn">
            <span>⚡</span> Open Related Tool ↗
          </Link>
        </div>
      )}
    </article>
  )
}

