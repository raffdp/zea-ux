/* eslint-disable require-jsdoc */
import { BaseTool, ZeaPointerEvent, ZeaMouseEvent, ZeaTouchEvent, XRControllerEvent } from '@zeainc/zea-engine'

/**
 * @extends BaseTool
 */
class ToolManager extends BaseTool {
  toolStack: BaseTool[]
  tools: BaseTool
  constructor() {
    super()
    this.tools = {}
    this.toolStack = []
  }

  registerTool(toolName: string, tool: BaseTool): void {
    this.tools[toolName] = tool
  }

  pushTool(toolName: string): void{
    const tool = this.tools[toolName]
    if (!tool) throw Error('Tool not found' + toolName)
    if (tool.activateTool) tool.activateTool()
    this.toolStack.push(this.tools[toolName])
  }

  popTool(): void {
    if (this.toolStack.length == 0) {
      throw Error('Tool stack is empty')
    }
    const tool = this.toolStack[this.toolStack.length - 1]
    if (tool.deactivateTool) tool.deactivateTool()
    this.toolStack.pop()
  }

  /**
   * Returns the tool currently at the top of the stack.
   * @return {Tool} - the currently active tool.
   */
  activeTool(): BaseTool {
    if (this.toolStack.length > 0) {
      return this.toolStack[this.toolStack.length - 1]
    }
    return ''
  }

  /**
   * Returns the name of the tool currently at the top of the stack.
   * @return - the name of the tool.
   */
  activeToolName(): string {
    if (this.toolStack.length > 0) {
      const tool = this.toolStack[this.toolStack.length - 1]
      for (const key in this.tools) {
        if (this.tools[key] == tool) return key
      }
    }
    return ''
  }

  // ///////////////////////////////////
  // Pointer events

  /**
   * Event fired when a pointing device button is pressed while the pointer is over the tool.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerDown(event: ZeaMouseEvent): void {
    for (let i = this.toolStack.length - 1; i >= 0; i--) {
      const tool = this.toolStack[i]
      if (tool.onPointerDown) {
        tool.onPointerDown(event)
        if (!event.propagating) break
      }
    }
  }

  /**
   * Event fired when a pointing device is moved while the cursor's hotspot is inside it.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerMove(event: ZeaMouseEvent): void {
    for (let i = this.toolStack.length - 1; i >= 0; i--) {
      const tool = this.toolStack[i]
      if (tool.onPointerMove) {
        tool.onPointerMove(event)
        if (!event.propagating) break
      }
    }
  }

  /**
   * Event fired when a pointing device button is released while the pointer is over the tool.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerUp(event: ZeaMouseEvent): void {
    for (let i = this.toolStack.length - 1; i >= 0; i--) {
      const tool = this.toolStack[i]
      if (tool.onPointerUp) {
        tool.onPointerUp(event)
        if (!event.propagating) break
      }
    }
  }

  /**
   * Event fired when a pointing device button is double clicked on the tool.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerDoublePress(event: ZeaMouseEvent): void {
    for (let i = this.toolStack.length - 1; i >= 0; i--) {
      const tool = this.toolStack[i]
      if (tool.onPointerDoublePress) {
        tool.onPointerDoublePress(event)
        if (!event.propagating) break
      }
    }
  }

  /**
   * Event fired when the user rotates the pointing device wheel.
   *
   * @param {MouseEvent} event - The event param.
   */
  onWheel(event: ZeaMouseEvent): void {
    for (let i = this.toolStack.length - 1; i >= 0; i--) {
      const tool = this.toolStack[i]
      if (tool.onWheel) {
        tool.onWheel(event)
        if (!event.propagating) break
      }
    }
  }

  // ///////////////////////////////////
  // Keyboard events

  /**
   * Event fired when the user presses a key on the keyboard.
   *
   * @param {KeyboardEvent} event - The event param.
   */
  //TODO: keyboard event?
  onKeyPressed(event): void {
    for (let i = this.toolStack.length - 1; i >= 0; i--) {
      const tool = this.toolStack[i]
      if (tool.onKeyPressed) {
        tool.onKeyPressed(event)
        if (!event.propagating) break
      }
    }
  }

  /**
   * Event fired when the user presses down a key on the keyboard.
   *
   * @param {KeyboardEvent} event - The event param.
   */
  onKeyDown(event): void {
    for (let i = this.toolStack.length - 1; i >= 0; i--) {
      const tool = this.toolStack[i]
      if (tool.onKeyDown) {
        tool.onKeyDown(event)
        if (!event.propagating) break
      }
    }
  }

  /**
   * Event fired when the user releases a key on the keyboard.
   *
   * @param {KeyboardEvent} event - The event param.
   */
  onKeyUp(event): void {
    for (let i = this.toolStack.length - 1; i >= 0; i--) {
      const tool = this.toolStack[i]
      if (tool.onKeyUp) {
        tool.onKeyUp(event)
        if (!event.propagating) break
      }
    }
  }
}

export { ToolManager }
