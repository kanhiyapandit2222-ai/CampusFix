import { Search, SlidersHorizontal, X } from 'lucide-react';

/**
 * SearchFilter — search input + status chip filters.
 *
 * Props:
 *   search       string
 *   onSearch     fn(value)
 *   activeFilter string
 *   onFilter     fn(value)
 *   filters      [{value, label}]    — chip options
 *   placeholder  string
 */
export function SearchFilter({
  search = '',
  onSearch,
  activeFilter = 'all',
  onFilter,
  filters = [],
  placeholder = 'Search complaints…',
}) {
  return (
    <div className="filter-bar">
      {/* Search */}
      <div className="search-field">
        <Search size={15} className="search-field-icon" />
        <input
          id="complaint-search"
          type="search"
          className="form-input"
          placeholder={placeholder}
          value={search}
          onChange={e => onSearch?.(e.target.value)}
          aria-label="Search complaints"
        />
      </div>

      {/* Chips */}
      {filters.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f.value}
              className={`filter-chip${activeFilter === f.value ? ' active' : ''}`}
              onClick={() => onFilter?.(f.value)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Standard status filter set */
export const STATUS_FILTERS = [
  { value: 'all',         label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved' },
  { value: 'rejected',    label: 'Rejected' },
];
