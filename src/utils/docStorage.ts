import type { DocEntity, DocId } from '../types/doc'
import { storage } from './storage'
import { createId } from './id'

// 文档列表存储 key（由 storage 负责具体落盘策略/实现）
const DOCS_KEY = 'whale_space_docs'

/**
 * 将不可信输入（例如历史版本数据/异常写入）规范化为 DocEntity[]
 * - 丢弃结构不完整的项
 * - 兜底缺失字段，保证业务代码拿到的数据可用
 */
function normalizeDocs(input: unknown): DocEntity[] {
  if (!Array.isArray(input)) return []
  return input
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const obj = item as Partial<DocEntity>
      if (!obj.id || !obj.title) return null
      // 时间戳字段缺失时兜底为当前时间，避免格式化/排序逻辑出错
      const createdAt = typeof obj.createdAt === 'number' ? obj.createdAt : Date.now()
      const updatedAt = typeof obj.updatedAt === 'number' ? obj.updatedAt : Date.now()
      return {
        id: String(obj.id),
        title: String(obj.title),
        content: typeof obj.content === 'string' ? obj.content : '',
        createdAt,
        updatedAt,
        lastVisitedAt:
          // lastVisitedAt 缺失时，优先回退为 updatedAt，再回退为 createdAt
          typeof obj.lastVisitedAt === 'number'
            ? obj.lastVisitedAt
            : typeof obj.updatedAt === 'number'
              ? updatedAt
              : createdAt
      } satisfies DocEntity
    })
    .filter((x): x is DocEntity => Boolean(x))
}

export const docStorage = {
  /**
   * 读取全部文档（包含数据清洗/兜底）
   */
  loadAll(): DocEntity[] {
    const raw = storage.get<unknown>(DOCS_KEY)
    return normalizeDocs(raw)
  },

  /**
   * 覆盖写入全部文档（调用方负责传入完整数组）
   */
  saveAll(next: DocEntity[]) {
    storage.set(DOCS_KEY, next)
  },

  /**
   * 创建文档并写入存储（默认插入到列表头部）
   */
  create(input: { title: string; content?: string }): DocEntity {
    const now = Date.now()
    const doc: DocEntity = {
      id: createId('doc'),
      title: input.title,
      content: input.content ?? '',
      createdAt: now,
      updatedAt: now,
      lastVisitedAt: now
    }
    const docs = this.loadAll()
    // 新建文档置顶，便于“最近”列表立即可见
    docs.unshift(doc)
    this.saveAll(docs)
    return doc
  },

  /**
   * 更新文档内容/标题，同时刷新 updatedAt
   */
  update(id: DocId, patch: Partial<Pick<DocEntity, 'title' | 'content'>>) {
    const docs = this.loadAll()
    const idx = docs.findIndex((d) => d.id === id)
    if (idx < 0) return
    docs[idx] = {
      ...docs[idx],
      ...patch,
      updatedAt: Date.now()
    }
    this.saveAll(docs)
  },

  /**
   * 记录一次访问时间（用于最近访问排序/展示）
   */
  touch(id: DocId) {
    const docs = this.loadAll()
    const idx = docs.findIndex((d) => d.id === id)
    if (idx < 0) return
    docs[idx] = {
      ...docs[idx],
      lastVisitedAt: Date.now()
    }
    this.saveAll(docs)
  },

  /**
   * 删除指定文档
   */
  remove(id: DocId) {
    const docs = this.loadAll().filter((d) => d.id !== id)
    this.saveAll(docs)
  }
}
