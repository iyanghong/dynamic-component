export interface CleverPopupProps {
  title?: string;
  width?: number | string;
  mode?: 'modal' | 'drawer';
  placement?: 'top' | 'right' | 'bottom' | 'left';
  [key: string]: any;
}
