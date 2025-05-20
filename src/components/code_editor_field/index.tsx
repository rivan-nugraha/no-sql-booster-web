import Editor from "@monaco-editor/react";
import { FormField } from "../form";
import { useEffect } from "react";

interface CodeEditorFieldProps{
  control: any;
  name: string;
  height?: string;
  language?: string;
  value?: string | number;
}

const CodeEditorField = ({
  control,
  name,
  height = "h-100",
  language = "javascript",
  value,
}: CodeEditorFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <InternalCodeEditor
            height={height}
            language={language}
            externalValue={value}
            field={field}
          />
        );
      }}
    />
  );
};

const InternalCodeEditor = ({
  height,
  language,
  externalValue,
  field,
}: {
  height: string;
  language: string;
  externalValue?: string | number;
  field: { value: string; onChange: (val: string) => void; name: string };
}) => {
  useCodeEditorInitialValue(field.value, externalValue, field.onChange);

  return (
    <div className="mb-4 w-full">
      <div className="border rounded-md overflow-hidden shadow-sm">
        <Editor
          className={`${height}`}
          defaultLanguage={language}
          theme="vs-dark"
          value={field.value}
          onChange={(val) => field.onChange(val ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          beforeMount={(monacoInstance) => {
            monacoInstance.languages.registerCompletionItemProvider(language, {
              provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position);
                const range = {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn: word.startColumn,
                  endColumn: word.endColumn,
                };

                return {
                  suggestions: [
                    {
                      label: "db",
                      kind: monacoInstance.languages.CompletionItemKind.Variable,
                      insertText: "db",
                      documentation: "MongoDB Database Object",
                      range,
                    },
                    {
                      label: "collection",
                      kind: monacoInstance.languages.CompletionItemKind.Function,
                      insertText: 'collection("$1")',
                      insertTextRules:
                        monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      documentation: "Access a MongoDB collection",
                      range,
                    },
                    {
                      label: "find",
                      kind: monacoInstance.languages.CompletionItemKind.Method,
                      insertText: "db.collection($1).find({})",
                      insertTextRules:
                        monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      documentation: "Find documents",
                      range,
                    },
                    {
                      label: "insertOne",
                      kind: monacoInstance.languages.CompletionItemKind.Method,
                      insertText: "db.collection($1).insertOne({})",
                      insertTextRules:
                        monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      documentation: "Insert a single document",
                      range,
                    },
                    {
                      label: "updateOne",
                      kind: monacoInstance.languages.CompletionItemKind.Method,
                      insertText: 'db.collection("$1").updateOne({$2}, {$3})',
                      insertTextRules:
                        monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      documentation: "Update a single document with matching data",
                      range,
                    },
                    {
                      label: "updateMany",
                      kind: monacoInstance.languages.CompletionItemKind.Method,
                      insertText: 'db.collection("$1").updateMany({$2}, {$3})',
                      insertTextRules:
                        monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      documentation: "Update a many document with matching data",
                      range,
                    },
                    {
                      label: "deleteOne",
                      kind: monacoInstance.languages.CompletionItemKind.Method,
                      insertText: 'db.collection("$1").deleteOne({})',
                      insertTextRules:
                        monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      documentation: "Delete a one document with matching data",
                      range,
                    },
                    {
                      label: "deleteMany",
                      kind: monacoInstance.languages.CompletionItemKind.Method,
                      insertText: 'db.collection("$1").deleteMany({})',
                      insertTextRules:
                        monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                      documentation: "Delete a many document with matching data",
                      range,
                    },
                  ],
                };
              },
            });
          }}
        />
      </div>
    </div>
  );
};


const useCodeEditorInitialValue = (
  currentValue: string,
  incomingValue: string | number | undefined,
  onChange: (val: string) => void
) => {
  useEffect(() => {
    if (incomingValue !== undefined && incomingValue !== currentValue) {
      onChange(String(incomingValue));
    }
  }, [incomingValue, currentValue, onChange]);
};

export default CodeEditorField;