import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? "");
        setDisplayName(user.user_metadata?.display_name ?? "");
      }
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName.trim() },
    });
    setSavingProfile(false);
    if (error) {
      toast.error("שגיאה בשמירת הפרטים: " + error.message);
    } else {
      toast.success("הפרטים עודכנו");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast.error("שגיאה בעדכון הסיסמה: " + error.message);
    } else {
      toast.success("הסיסמה עודכנה");
      setNewPassword("");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

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
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="display-name">שם תצוגה</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="הכנס שם..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">לא ניתן לשנות אימייל כרגע.</p>
            </div>
            <Button size="sm" type="submit" disabled={savingProfile}>
              {savingProfile ? "שומר..." : "שמור שינויים"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">שינוי סיסמה</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">סיסמה חדשה</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                autoComplete="new-password"
              />
            </div>
            <Button size="sm" variant="outline" type="submit" disabled={savingPassword}>
              {savingPassword ? "מעדכן..." : "עדכן סיסמה"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ניהול החשבון</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">התנתקות</div>
              <div className="text-xs text-muted-foreground">יוצא מהמערכת</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              התנתק
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
