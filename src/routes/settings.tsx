import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "הגדרות — מכתבים אישיים" },
      { name: "description", content: "פרטי משתמש וניהול חשבון." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">הגדרות</h1>
        <p className="text-sm text-muted-foreground">פרטי המשתמש וניהול החשבון</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">פרטי משתמש</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">שם</Label>
            <Input id="name" defaultValue="משתמש לדוגמה" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">אימייל</Label>
            <Input id="email" type="email" defaultValue="user@example.com" />
          </div>
          <Button size="sm">שמור שינויים</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">שינוי סיסמה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current">סיסמה נוכחית</Label>
            <Input id="current" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new">סיסמה חדשה</Label>
            <Input id="new" type="password" />
          </div>
          <Button size="sm" variant="outline">
            עדכן סיסמה
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ניהול החשבון</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <Button variant="destructive" size="sm">
            מחק חשבון
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
