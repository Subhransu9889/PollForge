import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/utils/validation'
import type { LoginFormData } from '@/utils/validation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TypographyH2, TypographyP } from '@/components/ui/typography'
import { Spinner } from '@/components/ui/spinner'

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  isLoading?: boolean
  onSwitchToRegister: () => void
}

export function LoginForm({ onSubmit, isLoading, onSwitchToRegister }: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (data: LoginFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      // Error is handled by parent
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div>
          <TypographyH2>Welcome back</TypographyH2>
          <TypographyP className="mt-1 text-sm">Sign in to manage polls and publish results.</TypographyP>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Spinner className="w-4 h-4 mr-2" />}
          Sign In
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onSwitchToRegister}
          disabled={isLoading}
        >
          Don't have an account? Register
        </Button>
      </form>
    </Form>
  )
}
