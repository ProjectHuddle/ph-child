import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  containerType?: 'flex' | 'grid';
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  className?: string;
}

interface ItemProps {
  children: React.ReactNode;
  className?: string;
}

const Item: React.FC<ItemProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

export const Container: React.FC<ContainerProps> & { Item: React.FC<ItemProps> } = ({
  children,
  containerType = 'flex',
  direction = 'row',
  justify = 'start',
  align = 'start',
  gap = 'md',
  wrap = 'nowrap',
  className = '',
}) => {
  const baseClasses = containerType === 'flex' ? 'flex' : 'grid';
  
  const directionClasses = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    column: 'flex-col',
    'column-reverse': 'flex-col-reverse',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
  };

  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
  };

  const classes = [
    baseClasses,
    containerType === 'flex' ? directionClasses[direction] : '',
    containerType === 'flex' ? justifyClasses[justify] : '',
    containerType === 'flex' ? alignClasses[align] : '',
    gapClasses[gap],
    containerType === 'flex' ? wrapClasses[wrap] : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

Container.Item = Item;