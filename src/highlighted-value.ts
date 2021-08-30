/**
 * The Highlighted Value
 */
export class NgHighlightedValue {
  /**
   * Content of the highlighted item that was clicked
   */
  public readonly content: string;
  /**
   * The type (or class name) associated with the highlighted item that was clicked.
   *
   * @see NgHighlighterPatternDirective.className
   */
  public readonly type: string = null;
  /**
   * Optional. Arbitrary rel associated with the clicked highlighted element.
   * This is determined by how the highlighted item's content is formatted.
   */
  public readonly rel: string = null;

  constructor(content: string, type: string = null, rel: string = null) {
    this.content = content;
    this.type = type;
    this.rel = rel;
  }
}
