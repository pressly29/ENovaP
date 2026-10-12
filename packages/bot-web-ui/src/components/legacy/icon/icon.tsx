import React from 'react';
import classNames from 'classnames';
import { getKebabCase } from '@deriv/shared';
import './icon.scss';

/**
 * The template's @deriv/components no longer ships the sprite-based `Icon`.
 * This keeps the old API for the bot UI, bundling only the SVGs it uses
 * (./svg, copied from the previous @deriv/components icon set) through
 * svg-sprite-loader's runtime sprite.
 */

type TSpriteSymbol = { id: string; viewBox?: string };

const symbols: Record<string, TSpriteSymbol> = (() => {
    const context = require.context('./svg', false, /\.svg$/);
    return context.keys().reduce<Record<string, TSpriteSymbol>>((registry, key) => {
        const mod = context(key);
        registry[key.replace(/^\.\//, '').replace(/\.svg$/, '')] = mod.default ?? mod;
        return registry;
    }, {});
})();

const getSymbolName = (icon: string) =>
    icon.startsWith('IcUnderlying') ? `ic-underlying-${icon.split('IcUnderlying')[1]}` : getKebabCase(icon);

type TIconProps = {
    className?: string;
    color?: 'active' | 'disabled' | 'green' | 'red' | 'secondary' | 'brand' | 'black' | 'orange' | string;
    custom_color?: string;
    data_testid?: string;
    description?: string;
    height?: number | string;
    icon: string;
    id?: string;
    size?: number | string;
    width?: number | string;
    onClick?: React.MouseEventHandler<SVGSVGElement>;
    onMouseDown?: React.MouseEventHandler<SVGSVGElement>;
    onMouseEnter?: React.MouseEventHandler<SVGSVGElement>;
    onMouseLeave?: React.MouseEventHandler<SVGSVGElement>;
    onTouchStart?: React.TouchEventHandler<SVGSVGElement>;
};

const Icon = React.forwardRef<SVGSVGElement, TIconProps>(
    (
        {
            className,
            color,
            custom_color,
            data_testid,
            description,
            height,
            icon,
            id,
            size = 16,
            width,
            onClick,
            onMouseDown,
            onMouseEnter,
            onMouseLeave,
            onTouchStart,
        },
        ref
    ) => {
        if (!icon) return null;
        const name = getSymbolName(icon);
        const symbol =
            symbols[name] ?? (name.startsWith('ic-underlying-') ? symbols[name.toUpperCase()] : undefined);
        if (!symbol) return null;

        return (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
                className={classNames('dc-icon', className, {
                    'dc-icon--active': color === 'active',
                    'dc-icon--disabled': color === 'disabled',
                    'dc-icon--green': color === 'green' || icon === 'IcProfit',
                    'dc-icon--red': color === 'red' || icon === 'IcLoss',
                    'dc-icon--secondary': color === 'secondary',
                    'dc-icon--brand': color === 'brand',
                    'dc-icon--black': color === 'black',
                    'dc-icon--orange': color === 'orange',
                })}
                data-testid={data_testid}
                height={height || size}
                id={id}
                width={width || size}
                viewBox={symbol.viewBox}
                onClick={onClick}
                onMouseDown={onMouseDown}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onTouchStart={onTouchStart}
                ref={ref}
                style={custom_color ? ({ '--fill-color1': custom_color } as React.CSSProperties) : undefined}
            >
                <desc>{description}</desc>
                <use xlinkHref={`#${symbol.id}`} />
            </svg>
        );
    }
);

Icon.displayName = 'Icon';

export default Icon;
