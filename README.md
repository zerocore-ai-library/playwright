# Playwright MCP Server

An MCP server for browser automation using Playwright. This server enables LLMs to interact with web pages through structured accessibility snapshots, bypassing the need for screenshots or visually-tuned models.

## Key Features

- **Fast and lightweight** - Uses Playwright's accessibility tree, not pixel-based input
- **LLM-friendly** - No vision models needed, operates purely on structured data
- **Deterministic tool application** - Avoids ambiguity common with screenshot-based approaches

## Setup

### Using tool CLI

Install the CLI from https://github.com/zerocore-ai/tool-cli

```bash
# Install from tool.store
tool install library/playwright
```

```bash
# View available tools
tool info library/playwright
```

```bash
# Navigate to a URL
tool call library/playwright -m browser_navigate -p url="https://example.com"
```

```bash
# Take an accessibility snapshot
tool call library/playwright -m browser_snapshot
```

```bash
# Click an element (ref comes from browser_snapshot output)
tool call library/playwright -m browser_click -p ref="submit-btn[1]"
```

### Prerequisites

- Node.js 18+
- Chrome, Firefox, WebKit, or Edge browser

## Configuration

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `browser` | No | `chrome` | Browser to use: `chrome`, `firefox`, `webkit`, `msedge` |
| `headless` | No | `true` | Run browser in headless mode |
| `isolated` | No | `true` | Keep profile in memory, avoid writing to disk |
| `caps` | No | `""` | Extra capabilities: `vision`, `pdf`, `testing`, `tracing`, `devtools` |
| `image_responses` | No | `allow` | Image response mode: `allow` or `omit` |
| `output_dir` | No | `~/Downloads/playwright-mcp-output` | Directory for screenshots, PDFs, and traces |
| `save_trace` | No | `false` | Save Playwright trace files |

## Tools

### Core Automation

#### `browser_navigate`

Navigate to a URL.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | The URL to navigate to |

#### `browser_navigate_back`

Go back to the previous page in the history.

**Input:** None

#### `browser_click`

Perform click on a web page element.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ref` | string | Yes | Exact target element reference from the page snapshot |
| `element` | string | No | Human-readable element description |
| `doubleClick` | boolean | No | Whether to perform a double click |
| `button` | string | No | Button to click, defaults to left |
| `modifiers` | array | No | Modifier keys to press |

#### `browser_type`

Type text into an editable element.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ref` | string | Yes | Exact target element reference from the page snapshot |
| `text` | string | Yes | Text to type into the element |
| `element` | string | No | Human-readable element description |
| `submit` | boolean | No | Whether to submit entered text (press Enter after) |
| `slowly` | boolean | No | Whether to type one character at a time |

#### `browser_hover`

Hover over an element on the page.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ref` | string | Yes | Exact target element reference from the page snapshot |
| `element` | string | No | Human-readable element description |

#### `browser_drag`

Perform drag and drop between two elements.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startElement` | string | Yes | Human-readable source element description |
| `startRef` | string | Yes | Exact source element reference from the page snapshot |
| `endElement` | string | Yes | Human-readable target element description |
| `endRef` | string | Yes | Exact target element reference from the page snapshot |

#### `browser_select_option`

Select an option in a dropdown.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ref` | string | Yes | Exact target element reference from the page snapshot |
| `values` | array | Yes | Array of values to select in the dropdown |
| `element` | string | No | Human-readable element description |

#### `browser_file_upload`

Upload one or multiple files.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `paths` | array | No | Absolute paths to files to upload. If omitted, file chooser is cancelled |

#### `browser_fill_form`

Fill multiple form fields at once.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fields` | array | Yes | Fields to fill in |

#### `browser_press_key`

Press a key on the keyboard.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | string | Yes | Name of the key to press or a character (e.g., `ArrowLeft`, `a`) |

#### `browser_handle_dialog`

Handle a browser dialog (alert, confirm, prompt).

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accept` | boolean | Yes | Whether to accept the dialog |
| `promptText` | string | No | The text for a prompt dialog |

#### `browser_evaluate`

Evaluate a JavaScript expression on the page or element.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `function` | string | Yes | JavaScript function: `() => { /* code */ }` or `(element) => { /* code */ }` |
| `element` | string | No | Human-readable element description |
| `ref` | string | No | Exact target element reference from the page snapshot |

#### `browser_run_code`

Run a Playwright code snippet.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | JavaScript function with Playwright code (e.g., `async (page) => { ... }`) |

### Snapshot & Screenshot

#### `browser_snapshot`

Capture an accessibility snapshot of the current page. This is the preferred method for understanding page content.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | string | No | Save snapshot to markdown file instead of returning it |

#### `browser_take_screenshot`

Take a screenshot of the current page. Note: You can't perform actions based on screenshots; use `browser_snapshot` for actions.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | No | Image format for the screenshot. Default is png |
| `filename` | string | No | File name to save the screenshot to |
| `element` | string | No | Human-readable element description (requires ref) |
| `ref` | string | No | Exact target element reference (requires element) |
| `fullPage` | boolean | No | Take screenshot of full scrollable page |

### Tab Management

#### `browser_tabs`

List, create, close, or select a browser tab.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | Operation to perform |
| `index` | number | No | Tab index for close/select. If omitted for close, current tab is closed |

#### `browser_close`

Close the current page.

**Input:** None

#### `browser_resize`

Resize the browser window.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `width` | number | Yes | Width of the browser window |
| `height` | number | Yes | Height of the browser window |

### Debug & Inspection

#### `browser_console_messages`

Returns all console messages from the page.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `level` | string | No | Level of messages to return (error, warning, info, debug). Defaults to info |
| `filename` | string | No | Filename to save messages to |

#### `browser_network_requests`

Returns all network requests since loading the page.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `includeStatic` | boolean | No | Include static resources (images, fonts, etc). Defaults to false |
| `filename` | string | No | Filename to save requests to |

### Wait & Timing

#### `browser_wait_for`

Wait for text to appear or disappear, or for a specified time to pass.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `time` | number | No | The time to wait in seconds |
| `text` | string | No | The text to wait for |
| `textGone` | string | No | The text to wait for to disappear |

### Vision-Based Tools

These tools require the `vision` capability to be enabled.

#### `browser_mouse_click_xy`

Click left mouse button at a given coordinate position.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `x` | number | Yes | X coordinate |
| `y` | number | Yes | Y coordinate |

#### `browser_mouse_move_xy`

Move mouse to a given position.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `x` | number | Yes | X coordinate |
| `y` | number | Yes | Y coordinate |

#### `browser_mouse_drag_xy`

Drag left mouse button to a given position.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `startX` | number | Yes | Start X coordinate |
| `startY` | number | Yes | Start Y coordinate |
| `endX` | number | Yes | End X coordinate |
| `endY` | number | Yes | End Y coordinate |

#### `browser_mouse_down`

Press mouse button down.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `button` | string | No | Button to press, defaults to left |

#### `browser_mouse_up`

Release mouse button.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `button` | string | No | Button to release, defaults to left |

#### `browser_mouse_wheel`

Scroll using the mouse wheel.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deltaX` | number | Yes | X delta |
| `deltaY` | number | Yes | Y delta |

### PDF Generation

Requires the `pdf` capability to be enabled.

#### `browser_pdf_save`

Save the current page as a PDF file.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | string | No | File name to save the PDF to |

### Testing Tools

Requires the `testing` capability to be enabled.

#### `browser_generate_locator`

Generate a Playwright locator for the given element to use in tests.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ref` | string | Yes | Exact target element reference from the page snapshot |
| `element` | string | No | Human-readable element description |

#### `browser_verify_element_visible`

Verify an element is visible on the page.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | Yes | ROLE of the element from the snapshot |
| `accessibleName` | string | Yes | ACCESSIBLE_NAME of the element from the snapshot |

#### `browser_verify_text_visible`

Verify text is visible on the page. Prefer `browser_verify_element_visible` if possible.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | TEXT to verify from the snapshot |

#### `browser_verify_list_visible`

Verify a list is visible on the page.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `element` | string | Yes | Human-readable list description |
| `ref` | string | Yes | Exact target element reference that points to the list |
| `items` | array | Yes | Items to verify |

#### `browser_verify_value`

Verify an element's value.

**Input:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Type of the element |
| `element` | string | Yes | Human-readable element description |
| `ref` | string | Yes | Exact target element reference |
| `value` | string | Yes | Value to verify. For checkbox, use "true" or "false" |

### Setup

#### `browser_install`

Install the browser specified in the config. Call this if you get an error about the browser not being installed.

**Input:** None

## License

Apache-2.0

## References

- https://github.com/microsoft/playwright-mcp
- https://playwright.dev
