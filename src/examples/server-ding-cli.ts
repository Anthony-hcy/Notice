/**
 * 更新通知
 */

import { hook, update_notices } from '../core/index.ts'
import { add_hook } from '../plugin/cli/index.ts'
import robot from '../plugin/ding/index.ts'
import add_normalize_hook from '../plugin/normalize/index.ts'
// import add_proxy_hook from '../plugin/proxy/index.ts'
import add_retry_hook from '../plugin/retry/index.ts'
import add_rss_hook from '../plugin/rss/index.ts'
import { logger } from '../util/logger.ts'

add_hook.verbose(hook)
add_hook.progress_bar(hook)
// add_proxy_hook(hook)
add_retry_hook(hook)
add_normalize_hook(hook)
add_rss_hook(hook)

const { new_notices, change } = await update_notices()

const MAX_ITEMS = 20 // ← 每条钉钉消息最多列出的通知数，想发多少改这里

function group(prefix: string) {
  return new_notices.filter((n) => n.source.name.startsWith(prefix))
}

async function send_group(title: string, list: typeof new_notices) {
  if (list.length === 0) return
  const rows = [
    `发现 ${list.length} 项新通知。`,
    ...list.slice(0, MAX_ITEMS).map((n) => "- " + n.to_markdown()),
    ...(list.length > MAX_ITEMS ? [`（其余 ${list.length - MAX_ITEMS} 项见 RSS）`] : []),
  ]
  await robot.markdown(title, rows.join("\n\n"))
}

await send_group(`【BIT】发现新通知`, group("Bit_"))
await send_group(`【BITZH】发现新通知`, group("Bitzh_"))

if (new_notices.length === 0) {
  await robot.markdown("未发现新通知", `未发现新通知。（过期 ${change.drop} 项）`)
}
