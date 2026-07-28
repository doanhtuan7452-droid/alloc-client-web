import React, { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";

/**
 * Trích xuất chuỗi văn bản an toàn từ content (dù là object, array hay stringified JSON)
 */
export function extractSafeTextContent(content) {
  if (content === null || content === undefined) return "";

  if (typeof content === "string") {
    const trimmed = content.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return extractSafeTextContent(parsed);
      } catch {
        // Nếu không phải JSON hợp lệ, giữ nguyên string gốc
      }
    }
    return content;
  }

  if (typeof content === "object") {
    if (content.response && typeof content.response === "string") {
      return extractSafeTextContent(content.response);
    }
    if (content.message && typeof content.message === "string") {
      return extractSafeTextContent(content.message);
    }
    if (content.content && typeof content.content === "string") {
      return extractSafeTextContent(content.content);
    }
    if (content.text && typeof content.text === "string") {
      return extractSafeTextContent(content.text);
    }
    try {
      return JSON.stringify(content, null, 2);
    } catch {
      return "[Cấu trúc dữ liệu không hợp lệ]";
    }
  }

  return String(content);
}

/**
 * Component hiển thị Code Block với nút Copy
 */
function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl border border-white/10 bg-[#080B14] overflow-hidden font-mono text-[11px] shadow-lg">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#101726] border-b border-white/10 text-slate-400">
        <span className="flex items-center gap-1.5 text-purple-400 font-semibold text-[10px] uppercase tracking-wider">
          <Code2 className="w-3 h-3" />
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px]"
          title="Sao chép mã"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-slate-200 custom-scrollbar leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Render từng dòng văn bản với Inline Code (`code`) và Bold (**text**)
 */
function FormattedLine({ text }) {
  if (!text) return <br />;

  let isBullet = false;
  let cleanText = text;
  const trimmed = text.trim();
  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
    isBullet = true;
    cleanText = trimmed.substring(2);
  }

  // Thắt nút hỗ trợ Inline Code
  const parts = cleanText.split(/(`[^`]+`)/g);
  const renderedContent = (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          const inlineCode = part.slice(1, -1);
          return (
            <code
              key={index}
              className="mx-0.5 px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-500/30 text-purple-300 font-mono text-[11px]"
            >
              {inlineCode}
            </code>
          );
        }

        // Hỗ trợ Bold text **bold**
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={index}>
            {boldParts.map((bPart, bIndex) => {
              if (bPart.startsWith("**") && bPart.endsWith("**") && bPart.length > 4) {
                return (
                  <strong key={bIndex} className="font-bold text-slate-100">
                    {bPart.slice(2, -2)}
                  </strong>
                );
              }
              return bPart;
            })}
          </span>
        );
      })}
    </>
  );

  if (isBullet) {
    return (
      <div className="flex items-start gap-1.5 ml-4 my-1">
        <span className="text-purple-400 mt-1.5 text-[8px]">●</span>
        <span className="flex-1 text-purple-200/80">{renderedContent}</span>
      </div>
    );
  }

  return <span>{renderedContent}</span>;
}

/**
 * Formatter chính định dạng nội dung tin nhắn AI thành JSX Node an toàn
 */
export default function AIMessageFormatter({ content }) {
  const safeText = extractSafeTextContent(content);

  if (!safeText) {
    return <span className="italic text-slate-500">[Tin nhắn trống]</span>;
  }

  // Tách văn bản thành các phần Code Blocks (```) và Văn bản thường
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(safeText)) !== null) {
    const textBefore = safeText.substring(lastIndex, match.index);
    if (textBefore) {
      blocks.push({ type: "text", content: textBefore });
    }
    blocks.push({
      type: "code",
      language: match[1] || "",
      code: match[2].trim(),
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  const remainingText = safeText.substring(lastIndex);
  if (remainingText) {
    blocks.push({ type: "text", content: remainingText });
  }

  return (
    <div className="space-y-1">
      {blocks.map((block, bIdx) => {
        if (block.type === "code") {
          return <CodeBlock key={bIdx} language={block.language} code={block.code} />;
        }

        // Với văn bản thường, phân chia thành các đoạn/dòng
        const lines = block.content.split("\n");
        return (
          <div key={bIdx} className="space-y-1">
            {lines.map((line, lIdx) => (
              <div key={lIdx} className="leading-relaxed">
                <FormattedLine text={line} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
