FEATURE - file types preview and edit

New feature:
Must accept many filetypes, and allow the to have a "preview" and "editable" version:
- Extend file types accepted to: docx,xlsx,pdf,gif,jpeg,webm,md
- Use as many extensions and types as possible.
- If necessary, use pandoc to convert original docs to simpler representatinos that can be shown in preview.
- Keep track of those preview/editable files to move/remove/archive with the original files.
- The preview files could have added document id (like "example.docx" and "example.docs.preview.md" for editable version and "example.docs.preview.md" for readonly versions)

nexo-prj/apps/nexo-prj/src/components/FilePreview.tsx
