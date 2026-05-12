import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { BarChart3, LogOut } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      <div className="flex items-center gap-3">
        <div className="brand-mark">
          <BarChart3 className="size-5" />
        </div>
        <div>
          <div className="brand">PollForge</div>
          <p className="text-xs text-muted">Realtime poll builder</p>
        </div>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">
              {user.firstName || user.name || 'Workspace'}
            </p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      )}
    </header>
  )
}
