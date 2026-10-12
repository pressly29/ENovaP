// Types for the components below, copied from the pre-template @deriv/components.
export type TAccordionItem = Array<{
    header: string;
    content: React.ReactNode;
}>;

export type TAccordionProps = {
    className?: string;
    icon_close?: string;
    icon_open?: string;
    list: TAccordionItem;
};

export type TItem = {
    id: string;
    value: Array<TItem> | string;
};
