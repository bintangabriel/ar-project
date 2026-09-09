'use client';

import clsx from 'clsx';
import React from 'react';
import { Button as AntDesignButton } from 'antd';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'primary' | 'dashed' | 'link' | 'text' | 'default' | undefined;
  danger?: boolean;
  color?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  htmlType?: 'submit' | 'reset' | 'button' | undefined;
};

const Button: React.FC<ButtonProps> = ({ children, onClick, className, type = 'primary', danger = false, color = "green-1", disabled = false, icon, htmlType }: ButtonProps) => {
  return (
    <AntDesignButton
      disabled={disabled}
      type={type}
      onClick={onClick}
      style={{
        backgroundColor: `var(--color-${color})`,
      }}
      className={clsx(
        ' w-[148px] px-4 py-2 rounded-sm border border-gray-500 text-black text-sm hover:bg-gray-100 transition-',
        className
      )}
      danger={danger}
      icon={icon}
      htmlType={htmlType}
    >
      {children}
    </AntDesignButton>
  );
};

export default Button;