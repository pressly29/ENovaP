/**
 * Category Filter Component
 * 
 * Provides category filtering for Advanced Strategies tab
 */

import React from 'react';
import { observer } from 'mobx-react-lite';
import { BotCategoryFilter, CATEGORY_FILTERS, getCategoryFilterColor } from '../data/bot-tabs';
import './category-filter.scss';

interface CategoryFilterProps {
    activeFilter: BotCategoryFilter;
    onFilterChange: (filter: BotCategoryFilter) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = observer(({ activeFilter, onFilterChange }) => {
    return (
        <div className="bot-category-filter">
            <div className="bot-category-filter__label">Filter by Category:</div>
            <div className="bot-category-filter__filters">
                {CATEGORY_FILTERS.map(filter => {
                    const isActive = activeFilter === filter.id;
                    const color = getCategoryFilterColor(filter.id);

                    return (
                        <button
                            key={filter.id}
                            className={`bot-category-filter__button ${isActive ? 'bot-category-filter__button--active' : ''}`}
                            onClick={() => onFilterChange(filter.id as BotCategoryFilter)}
                            style={{
                                ...(isActive && {
                                    borderColor: color,
                                    background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                                    boxShadow: `0 2px 8px ${color}30`
                                })
                            }}
                        >
                            <span className="bot-category-filter__icon">{filter.icon}</span>
                            <span className="bot-category-filter__text">{filter.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

CategoryFilter.displayName = 'CategoryFilter';

export default CategoryFilter;
