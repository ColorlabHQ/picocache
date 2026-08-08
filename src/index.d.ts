/**
 * datasetConfig 配置选项
 */
export interface DatasetConfigOptions {
  /**
   * 属性前缀
   *
   * 支持：
   * - app
   * - app-scrolltop
   * - appScrolltop
   *
   * @default ""
   */
  prefix?: string;

  /**
   * 是否解析函数
   *
   * 当 data 属性值对应 window 上的函数时，
   * 返回该函数引用
   *
   * @default true
   */
  parseFunction?: boolean;

  /**
   * 排除解析的属性
   *
   * 支持：
   * - foo
   * - foo.bar
   * - config.animation
   */
  excludeKeys?: string[];
}

/**
 * 解析 HTMLElement 上的 data-* 属性
 *
 * @param element 目标元素
 * @param options 配置项
 *
 * @returns 解析后的配置对象
 */
export default function datasetConfig(
  element: HTMLElement,
  options?: DatasetConfigOptions,
): Record<string, unknown>;
