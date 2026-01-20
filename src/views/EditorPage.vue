<!-- 文档编辑页 -->
<template>
  <div v-if="!doc" class="ws-empty">
    <el-empty description="文档不存在" />
  </div>

  <div v-else class="ws-doc">
    <div class="ws-doc__toolbar-bar">
      <div class="ws-doc__toolbar">
        <button type="button" class="ws-toolbar-btn" :disabled="!canUndo" @click="undo">↶</button>
        <button type="button" class="ws-toolbar-btn" :disabled="!canRedo" @click="redo">↷</button>
        <button type="button" class="ws-toolbar-btn" @click="clearFormatting">⌫</button>

        <span class="ws-toolbar-sep" />

        <el-dropdown trigger="click" popper-class="ws-toolbar-popper" @command="onBlockCommand">
          <button type="button" class="ws-toolbar-select">
            <span>{{ blockLabel }}</span>
            <span class="ws-toolbar-caret">▾</span>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="p">正文</el-dropdown-item>
              <el-dropdown-item command="h1">标题 1</el-dropdown-item>
              <el-dropdown-item command="h2">标题 2</el-dropdown-item>
              <el-dropdown-item command="h3">标题 3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click" popper-class="ws-toolbar-popper ws-fontsize-popper" @command="onFontSizeCommand">
          <button type="button" class="ws-toolbar-select">
            <span>{{ editorFontSize }}px</span>
            <span class="ws-toolbar-caret">▾</span>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="12">12px</el-dropdown-item>
              <el-dropdown-item command="14">14px</el-dropdown-item>
              <el-dropdown-item command="16">16px</el-dropdown-item>
              <el-dropdown-item command="18">18px</el-dropdown-item>
              <el-dropdown-item command="20">20px</el-dropdown-item>
              <el-dropdown-item command="22">22px</el-dropdown-item>
              <el-dropdown-item command="24">24px</el-dropdown-item>
              <el-dropdown-item command="26">26px</el-dropdown-item>
              <el-dropdown-item command="30">30px</el-dropdown-item>
              <el-dropdown-item command="34">34px</el-dropdown-item>
              <el-dropdown-item command="36">36px</el-dropdown-item>
              <el-dropdown-item command="40">40px</el-dropdown-item>
              <el-dropdown-item command="48">48px</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <span class="ws-toolbar-sep" />

        <button type="button" class="ws-toolbar-btn" :class="{ 'is-active': isBold }" @click="toggleBold">B</button>
        <button type="button" class="ws-toolbar-btn ws-toolbar-btn--italic" :class="{ 'is-active': isItalic }" @click="toggleItalic">
          I
        </button>
        <button type="button" class="ws-toolbar-btn" :class="{ 'is-active': isUnderline }" @click="toggleUnderline">U</button>
        <button type="button" class="ws-toolbar-btn" :class="{ 'is-active': isStrike }" @click="toggleStrike">S</button>
        <button type="button" class="ws-toolbar-btn" :class="{ 'is-active': isCode }" @click="toggleCode">{ }</button>

        <span class="ws-toolbar-sep" />

        <button type="button" class="ws-toolbar-btn" :class="{ 'is-active': isBulletList }" @click="toggleBulletList">•</button>
        <button type="button" class="ws-toolbar-btn" :class="{ 'is-active': isOrderedList }" @click="toggleOrderedList">1.</button>
        <button type="button" class="ws-toolbar-btn" :class="{ 'is-active': isBlockquote }" @click="toggleBlockquote">“</button>
        <button type="button" class="ws-toolbar-btn" :class="{ 'is-active': isLink }" @click="toggleLink">🔗</button>
        <button type="button" class="ws-toolbar-btn" @click="insertHr">—</button>
      </div>
    </div>

    <div class="ws-doc__inner">
      <div class="ws-doc__header">
        <div class="ws-doc__title-wrap">
          <el-input v-model="title" class="ws-doc__title-input" placeholder="未命名文档" @change="onTitleCommit" />
        </div>

        <div class="ws-doc__meta">
          <el-avatar :size="22" class="ws-doc__avatar">
            {{ avatarText }}
          </el-avatar>
          <span class="ws-doc__author">{{ authorName }}</span>
          <span class="ws-doc__meta-sep">|</span>
          <span class="ws-doc__time">{{ updatedLabel }}</span>
        </div>
      </div>

      <div class="ws-doc__editor">
        <EditorContent :editor="editor" class="ws-doc__tiptap" :style="{ fontSize: `${editorFontSize}px` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { Placeholder } from '@tiptap/extensions'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { useDocsStore } from '../stores/docs'
import { debounce } from '../utils/debounce'
import { formatTime } from '../utils/time'

const props = defineProps<{ id: string }>()

const docsStore = useDocsStore()

const title = ref('')
const content = ref('')
const isSyncing = ref(false)
const editorFontSize = ref(16)

function getMarkdownOutput(inst: any) {
  if (!inst) return ''
  if (typeof inst.getMarkdown === 'function') return inst.getMarkdown()
  if (inst.storage?.markdown && typeof inst.storage.markdown.getMarkdown === 'function') return inst.storage.markdown.getMarkdown()
  if (typeof inst.getText === 'function') return inst.getText()
  return ''
}

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Link.configure({
      openOnClick: false
    }),
    Markdown.configure({
      markedOptions: { gfm: true }
    }),
    Placeholder.configure({
      placeholder: '输入内容（支持 Markdown）'
    })
  ],
  content: '',
  contentType: 'markdown',
  editorProps: {
    attributes: {
      class: 'ws-tiptap-prosemirror'
    }
  },
  onUpdate: (ctx: any) => {
    if (isSyncing.value) return
    content.value = getMarkdownOutput(ctx?.editor)
  }
})

function syncFromStore() {
  // 从 store 回放到编辑器本地状态；切换文档/刷新后需要重新同步
  const d = docsStore.getById(props.id)
  if (!d) return
  // 打开编辑器即算一次访问
  docsStore.touchVisit(d.id)
  title.value = d.title
  content.value = d.content
  if (editor.value) {
    isSyncing.value = true
    editor.value.commands.setContent(content.value || '', { contentType: 'markdown' })
    isSyncing.value = false
  }
}

onMounted(() => {
  docsStore.load()
  syncFromStore()
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

watch(
  editor,
  (inst) => {
    if (!inst) return
    isSyncing.value = true
    inst.commands.setContent(content.value || '', { contentType: 'markdown' })
    isSyncing.value = false
  },
  { immediate: true }
)

watch(
  () => props.id,
  () => {
    // 切换路由参数时重新加载并同步
    docsStore.load()
    syncFromStore()
  }
)

const doc = computed(() => docsStore.getById(props.id))

const authorName = computed(() => {
  const stored = localStorage.getItem('ws_user_name')
  return stored?.trim() || '我'
})

const avatarText = computed(() => {
  const t = authorName.value.trim()
  return t.slice(0, 1).toUpperCase()
})

const updatedLabel = computed(() => {
  if (!doc.value) return ''
  return `${formatTime(doc.value.updatedAt)} 修改`
})

// 内容保存采用防抖：连续输入时降低写入频率
const persist = debounce(() => {
  if (!doc.value) return
  if (doc.value.content === content.value) return
  docsStore.updateContent(doc.value.id, content.value)
}, 350)

watch(content, () => {
  if (!doc.value) return
  if (isSyncing.value) return
  persist()
})

function onTitleCommit() {
  if (!doc.value) return
  // 标题提交时做 trim，并兜底未命名
  docsStore.rename(doc.value.id, title.value.trim() || '未命名文档')
}

const isBold = computed(() => Boolean(editor.value?.isActive('bold')))
const isItalic = computed(() => Boolean(editor.value?.isActive('italic')))
const isStrike = computed(() => Boolean(editor.value?.isActive('strike')))
const isCode = computed(() => Boolean(editor.value?.isActive('code')))
const isUnderline = computed(() => Boolean(editor.value?.isActive('underline')))
const isBulletList = computed(() => Boolean(editor.value?.isActive('bulletList')))
const isOrderedList = computed(() => Boolean(editor.value?.isActive('orderedList')))
const isBlockquote = computed(() => Boolean(editor.value?.isActive('blockquote')))
const isLink = computed(() => Boolean(editor.value?.isActive('link')))

const blockLabel = computed(() => {
  if (editor.value?.isActive('heading', { level: 1 })) return '标题 1'
  if (editor.value?.isActive('heading', { level: 2 })) return '标题 2'
  if (editor.value?.isActive('heading', { level: 3 })) return '标题 3'
  return '正文'
})

const canUndo = computed(() => Boolean(editor.value?.can().chain().focus().undo().run()))
const canRedo = computed(() => Boolean(editor.value?.can().chain().focus().redo().run()))

function toggleBold() {
  editor.value?.chain().focus().toggleBold().run()
}

function toggleItalic() {
  editor.value?.chain().focus().toggleItalic().run()
}

function toggleStrike() {
  editor.value?.chain().focus().toggleStrike().run()
}

function toggleCode() {
  editor.value?.chain().focus().toggleCode().run()
}

function toggleUnderline() {
  editor.value?.chain().focus().toggleUnderline().run()
}

function toggleBulletList() {
  editor.value?.chain().focus().toggleBulletList().run()
}

function toggleOrderedList() {
  editor.value?.chain().focus().toggleOrderedList().run()
}

function toggleBlockquote() {
  editor.value?.chain().focus().toggleBlockquote().run()
}

function insertHr() {
  editor.value?.chain().focus().setHorizontalRule().run()
}

function clearFormatting() {
  editor.value?.chain().focus().unsetAllMarks().clearNodes().run()
}

function toggleLink() {
  if (!editor.value) return
  if (editor.value.isActive('link')) {
    editor.value.chain().focus().unsetLink().run()
    return
  }
  const href = window.prompt('请输入链接地址', 'https://')
  if (!href) return
  editor.value.chain().focus().extendMarkRange('link').setLink({ href }).run()
}

function onBlockCommand(cmd: string) {
  if (!editor.value) return
  const chain = editor.value.chain().focus()
  if (cmd === 'p') chain.setParagraph().run()
  else if (cmd === 'h1') chain.toggleHeading({ level: 1 }).run()
  else if (cmd === 'h2') chain.toggleHeading({ level: 2 }).run()
  else if (cmd === 'h3') chain.toggleHeading({ level: 3 }).run()
}

function onFontSizeCommand(cmd: string) {
  const next = Number(cmd)
  if (!Number.isFinite(next)) return
  editorFontSize.value = next
}

function undo() {
  editor.value?.chain().focus().undo().run()
}

function redo() {
  editor.value?.chain().focus().redo().run()
}
</script>

<style scoped>
.ws-doc {
  height: 100%;
  min-height: 0;
  overflow: auto;
  background: var(--el-bg-color);
}

.ws-doc__inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 28px 80px;
}

.ws-doc__header {
  margin-bottom: 22px;
}

.ws-doc__title {
  margin: 0;
  text-align: left;
  font-size: 34px;
  line-height: 1.25;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.ws-doc__title-wrap {
  display: flex;
  justify-content: flex-start;
}

:deep(.ws-doc__title-input) {
  width: 100%;
}

:deep(.ws-doc__title-input .el-input__wrapper) {
  box-shadow: none;
  background: transparent;
  padding: 0;
}

:deep(.ws-doc__title-input .el-input__inner) {
  border: none;
  background: transparent;
  text-align: left;
  font-size: 34px;
  line-height: 1.25;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.ws-doc__meta {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.ws-doc__avatar {
  background: rgba(168, 85, 247, 0.9);
  color: #fff;
}

.ws-doc__meta-sep {
  opacity: 0.55;
}

.ws-doc__editor {
  margin-top: 10px;
}

:deep(.ws-doc__toolbar-bar) {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-top-color: color-mix(in srgb, var(--el-border-color-lighter) 45%, transparent);
  border-bottom-color: color-mix(in srgb, var(--el-border-color-lighter) 45%, transparent);
}

:deep(.ws-doc__toolbar) {
  width: 100%;
  box-sizing: border-box;
  max-width: 916px;
  margin: 0 auto;
  min-height: 40px;
  padding: 10px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 15px;
  color: var(--el-text-color-secondary);
}

:deep(.ws-doc__tiptap) {
  min-height: 520px;
}

:deep(.ws-tiptap-prosemirror) {
  outline: none;
  border: none;
  background: transparent;
  font-size: inherit;
  line-height: 1.9;
  color: var(--el-text-color-primary);
}

.ws-toolbar-btn,
.ws-toolbar-select {
  appearance: none;
  border: none;
  background: transparent;
  color: inherit;
  padding: 6px 8px;
  border-radius: 8px;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  font: inherit;
}

.ws-toolbar-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.ws-toolbar-btn:hover:not(:disabled),
.ws-toolbar-select:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.ws-toolbar-btn.is-active {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

.ws-toolbar-btn--italic {
  font-style: italic;
}

.ws-toolbar-sep {
  width: 1px;
  height: 20px;
  background: var(--el-border-color-lighter);
  margin: 0 6px;
}

.ws-toolbar-select {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ws-toolbar-caret {
  opacity: 0.7;
  font-size: 12px;
}

:global(.ws-fontsize-popper .el-dropdown-menu) {
  min-width: 80px;
}

:global(.ws-toolbar-popper .el-dropdown-menu__item) {
  justify-content: center;
  text-align: center;
}

:deep(.ws-tiptap-prosemirror p) {
  margin: 0 0 12px;
}

:deep(.ws-tiptap-prosemirror h1) {
  font-size: 30px;
  line-height: 1.25;
  margin: 22px 0 14px;
}

:deep(.ws-tiptap-prosemirror h2) {
  font-size: 22px;
  line-height: 1.3;
  margin: 18px 0 12px;
}

:deep(.ws-tiptap-prosemirror ul),
:deep(.ws-tiptap-prosemirror ol) {
  padding-left: 22px;
  margin: 0 0 12px;
}

:deep(.ws-tiptap-prosemirror blockquote) {
  margin: 0 0 12px;
  padding-left: 12px;
  border-left: 3px solid var(--el-border-color);
  color: var(--el-text-color-secondary);
}

:deep(.ws-tiptap-prosemirror code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.95em;
  padding: 0 4px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.06);
}

:deep(.dark .ws-tiptap-prosemirror code) {
  background: rgba(255, 255, 255, 0.08);
}

:deep(.ws-tiptap-prosemirror hr) {
  border: none;
  border-top: 1px solid var(--el-border-color);
  margin: 16px 0;
}

:deep(.ws-tiptap-prosemirror .is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--el-text-color-secondary);
  pointer-events: none;
  height: 0;
}

</style>
