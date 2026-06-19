"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

// Simple Google icon component
function GoogleIcon(props: React.ComponentProps<"svg">) {
    return (
        <svg viewBox="0 0 24 24" {...props}>
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
        </svg>
    );
}

export default function SignupPage() {
  const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      router.replace("/dashboard");
    }
  }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const supabase = createSupabaseBrowserClient();

        const { error: err } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });

        setLoading(false);
        if (err) { setError(err.message); return; }

        // Check if we need email confirmation (depends on Supabase settings)
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.identities && user.identities.length === 0) {
            // Email already in use
            setError("An account with this email already exists.");
        } else {
            setSent(true);
        }
    };

    const handleGoogleSignIn = async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left panel — clean form */}
            <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-16 lg:px-20 xl:px-28 py-10">
                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-auto">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00f69b] text-white font-bold text-sm">
                        A
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-gray-900">
                        Andalus Health
                    </span>
                </div>

                {/* Form area — vertically centred */}
                <div className="flex-1 flex items-center">
                    <div className="w-full max-w-sm">
                        {sent ? (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <CheckCircle className="h-12 w-12 text-[#00f69b]" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 text-center">
                                    Check your email
                                </h1>
                                <p className="text-gray-500 text-center">
                                    We sent a confirmation link to <strong>{email}</strong>.<br />
                                    Click it to activate your account.
                                </p>
                                <Button
                                    variant="ghost"
                                    className="w-full text-gray-500 hover:text-gray-700"
                                    onClick={() => setSent(false)}
                                >
                                    Return to sign up
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2 mb-8">
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                        Create your account
                                    </h1>
                                    <p className="text-gray-500 text-[15px]">
                                        Start your 30-day free trial today
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="email@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-11 rounded-lg border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#00f69b] focus-visible:border-[#00f69b]"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                                Password
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="h-11 rounded-lg border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-[#00f69b] focus-visible:border-[#00f69b]"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    {error && <p className="text-sm text-red-500">{error}</p>}

                                    <Button
                                        type="submit"
                                        className="w-full h-11 font-medium rounded-lg bg-gray-900 hover:bg-gray-800 text-white"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Create account"
                                        )}
                                    </Button>
                                </form>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-gray-500">
                                            or continue with
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-11 font-medium rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={handleGoogleSignIn}
                                >
                                    <GoogleIcon className="h-5 w-5 mr-2" />
                                    Sign up with Google
                                </Button>

                                <p className="text-center text-sm text-gray-500 mt-6">
                                    Already have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="font-medium text-gray-900 hover:underline"
                                    >
                                        Log in
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom spacer for symmetry */}
                <div className="mt-auto" />
            </div>

            {/* Right panel — testimonial image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <Image
                    src="/clinic-testimonial.png"
                    alt="Doctor using Andalus Health ambient scribe"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Testimonial quote */}
                <div className="absolute inset-0 flex flex-col justify-center px-12 xl:px-16">
                    <blockquote className="space-y-6">
                        <p className="text-2xl xl:text-[28px] font-medium leading-snug text-white">
                            &ldquo;When you find a tool that simultaneously improves patient
                            experience and helps your clinic staff, then it&rsquo;s worth
                            every clinic taking a look.&rdquo;
                        </p>
                        <footer className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
                                DR
                            </div>
                            <div>
                                <p className="font-semibold text-white text-[15px]">
                                    Dr. Razif Ahmad
                                </p>
                                <p className="text-white/70 text-sm">
                                    Clinic Director, Klinik Prima
                                </p>
                            </div>
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
