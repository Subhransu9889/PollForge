import type { Question } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GripVertical, Plus, Trash2 } from 'lucide-react'

interface QuestionEditorProps {
  question: Question
  index: number
  onChange: (question: Question) => void
  onRemove: () => void
}

export function QuestionEditor({
  question,
  index,
  onChange,
  onRemove,
}: QuestionEditorProps) {
  return (
    <Card className="question-card">
      <CardContent className="pt-6 space-y-4">
        <div className="question-editor-head">
          <div className="question-index">
            <GripVertical className="size-4" />
            {index + 1}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              placeholder={`Question ${index + 1}`}
              value={question.text}
              onChange={(e) =>
                onChange({
                  ...question,
                  text: e.target.value,
                })
              }
              className="font-semibold"
            />
          </div>
          {index > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`required-${index}`}
            checked={question.required}
            onCheckedChange={(checked: boolean) =>
              onChange({
                ...question,
                required: checked,
              })
            }
          />
          <Label htmlFor={`required-${index}`} className="cursor-pointer">
            Mandatory
          </Label>
        </div>

        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select
            value={question.type}
            onValueChange={(value) => {
              if (!value) return

              onChange({
                ...question,
                type: value,
                options: value === 'text' ? [] : question.options.length >= 2 ? question.options : [{ label: '' }, { label: '' }],
              })
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="choice">Multiple choice</SelectItem>
              <SelectItem value="text">Text response</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {question.type === 'choice' ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted">Options</div>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="option-row">
                <Input
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option.label}
                  onChange={(e) => {
                    const newOptions = [...question.options]
                    newOptions[optionIndex] = { ...option, label: e.target.value }
                    onChange({
                      ...question,
                      options: newOptions,
                    })
                  }}
                />
                {optionIndex >= 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newOptions = question.options.filter((_, i) => i !== optionIndex)
                      onChange({
                        ...question,
                        options: newOptions,
                      })
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onChange({
                  ...question,
                  options: [...question.options, { label: '' }],
                })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-white/[0.04] px-3 py-2 text-sm text-muted">
            Respondents will see a text box instead of selectable options.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
