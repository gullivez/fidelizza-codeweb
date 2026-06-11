import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginChart } from "@/components/login/LoginChart";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Fidelizza" },
      { name: "description", content: "Acesse sua conta Fidelizza." },
    ],
  }),
  component: LoginPage,
});

type FormState = "idle" | "loading" | "error" | "blocked";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<FormState>("idle");
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    // Mock: blocked@fidelizza.com → blocked; anything else → error
    await new Promise((r) => setTimeout(r, 900));
    if (email.trim().toLowerCase() === "blocked@fidelizza.com") {
      setState("blocked");
    } else {
      setState("error");
    }
  };

  const disabled = state === "loading";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Mobile compact value header / Desktop right panel */}
      <aside className="order-first lg:order-last lg:w-[55%] bg-zinc-950 text-white relative overflow-hidden flex flex-col">
        {/* Decorative chart background */}
        <div className="hidden lg:block absolute inset-x-0 bottom-0 h-1/2 opacity-60 pointer-events-none">
          <LoginChart />
        </div>
        <div className="hidden lg:flex relative z-10 flex-1 flex-col justify-center px-12 xl:px-20 py-16">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-400 mb-8">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Fidelizza para Delivery
          </div>
          <h2 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.1] text-white max-w-xl">
            Transforme sua base de clientes em faturamento recorrente.
          </h2>
          <div className="mt-10 border-l-2 border-emerald-400 pl-5 max-w-lg">
            <p className="text-2xl xl:text-3xl font-semibold text-emerald-400 tabular-nums tracking-tight">
              R$ 4.200/mês
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              é a média recuperada por restaurantes em clientes inativos.
            </p>
          </div>
        </div>

        {/* Mobile compact header */}
        <div className="lg:hidden relative z-10 px-6 py-8">
          <h2 className="text-xl font-semibold text-white leading-snug">
            Transforme sua base de clientes em faturamento recorrente.
          </h2>
          <p className="mt-3 text-sm font-semibold text-emerald-400 tabular-nums">
            R$ 4.200/mês recuperados em média.
          </p>
        </div>
      </aside>

      {/* Left form column */}
      <main className="lg:w-[45%] flex items-center justify-center px-6 py-12 lg:py-0">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight text-zinc-950">
              Fidelizza
            </span>
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Entrar na sua conta
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Acesse o painel do seu restaurante.
          </p>

          {state === "error" && (
            <Alert
              variant="destructive"
              className="mt-6 border-rose-200 bg-rose-50 text-rose-900 [&>svg]:text-rose-600"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-rose-900">
                Email ou senha incorretos.
              </AlertDescription>
            </Alert>
          )}

          {state === "blocked" && (
            <Alert className="mt-6 border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-amber-900">
                Sua conta está suspensa.{" "}
                <a
                  href="mailto:suporte@fidelizza.app"
                  className="font-medium underline underline-offset-2"
                >
                  Fale com o suporte
                </a>
                .
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-700">
                Email
              </Label>
              <Input
                ref={emailRef}
                id="email"
                type="email"
                autoComplete="email"
                required
                disabled={disabled}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@restaurante.com"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-700">
                  Senha
                </Label>
                <Link
                  to="/login"
                  className="text-xs font-medium text-primary hover:text-primary/80"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={disabled}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={disabled}
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={disabled}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="mt-8 text-xs text-zinc-500">
            Acesso restrito. Solicite uma conta com seu gerente.
          </p>
        </div>
      </main>
    </div>
  );
}
