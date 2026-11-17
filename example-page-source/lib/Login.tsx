import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { TextField, Label, Input, FieldError, Link } from 'react-aria-components';
import { ArrowLeft, MailCheck, CircleCheck } from 'lucide-react';
import { DButton, PasswordField, MessageBanner, Listbox, cx, controlBase, fieldWrap, labelClass, errorClass, helpClass, fast } from './index';

export type LoginStep = 'signin' | 'forgot' | 'sent' | 'code' | 'instance' | 'loading' | 'reset' | 'resetdone';

const INSTANCES = ['Haiti - Official', 'Haiti - Training'];
const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);
const EMAIL_ERR = 'Enter an email address, for example name@organization.org.';

function EmailField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <TextField type="email" value={value} onChange={onChange} isInvalid={!!error} autoComplete="email" className={fieldWrap}>
      <Label className={labelClass}>Email address</Label>
      <Input className={cx(controlBase, 'h-8 pb-[2px]')} placeholder="name@organization.org" />
      {error && <FieldError className={errorClass}>{error}</FieldError>}
    </TextField>
  );
}

const linkClass = cx('rounded-sm text-body text-accent outline-none underline-offset-2 data-[hovered]:underline cursor-default', fast);

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-bg md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-inset p-12 md:flex" aria-label="About DELTA">
        <p className="text-section font-medium text-fg">DELTA</p>
        <div className="flex max-w-[440px] flex-col gap-6">
          <p className="text-page font-medium text-fg">Disaster &amp; Hazardous Events, Losses and Damages Tracking &amp; Analysis</p>
          <p className="text-body text-fg-2">A toolkit to collect, manage and analyze hazardous events and losses and damages data to support disaster risk reduction.</p>
        </div>
        <p className="text-label text-fg-2">United Nations Office for Disaster Risk Reduction</p>
      </aside>
      <main className="flex items-center justify-center px-4 py-12 md:px-12">
        <div className="flex w-full max-w-[360px] flex-col gap-8">
          <p className="text-section font-medium text-fg md:hidden">DELTA</p>
          {children}
        </div>
      </main>
    </div>
  );
}

function Heading({ title, text }: { title: string; text?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-page font-medium text-fg">{title}</h1>
      {text && <p className="text-body text-fg-2">{text}</p>}
    </div>
  );
}

export function LoginView({ onSignedIn, initialStep = 'signin' }: { onSignedIn: () => void; initialStep?: LoginStep }) {
  const [step, setStep] = useState<LoginStep>(initialStep);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [instance, setInstance] = useState<string[]>([]);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; code?: string; instance?: string; pw1?: string; pw2?: string; form?: boolean }>({});

  useEffect(() => { setStep(initialStep); setErrors({}); }, [initialStep]);
  useEffect(() => {
    if (step !== 'loading') return;
    const t = setTimeout(onSignedIn, 1800);
    return () => clearTimeout(t);
  }, [step]);

  const go = (s: LoginStep) => { setErrors({}); setStep(s); };

  const signIn = (e: FormEvent) => {
    e.preventDefault();
    const n: typeof errors = {};
    if (!email) n.email = 'Enter your email.'; else if (!isEmail(email)) n.email = EMAIL_ERR;
    if (!password) n.password = 'Enter your password.';
    setErrors(n);
    if (Object.keys(n).length) return;
    if (password === 'wrong') { setErrors({ form: true }); return; }
    go('code');
  };
  const sendLink = (e: FormEvent) => {
    e.preventDefault();
    if (!email) { setErrors({ email: 'Enter your email.' }); return; }
    if (!isEmail(email)) { setErrors({ email: EMAIL_ERR }); return; }
    go('sent');
  };
  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setErrors({ code: 'Enter the code.' }); return; }
    go('instance');
  };
  const submitInstance = (e: FormEvent) => {
    e.preventDefault();
    if (!instance.length) { setErrors({ instance: 'Select an instance to continue.' }); return; }
    go('loading');
  };
  const submitReset = (e: FormEvent) => {
    e.preventDefault();
    const n: typeof errors = {};
    if (pw1.length < 12) n.pw1 = 'Use at least 12 characters.';
    if (pw2 !== pw1) n.pw2 = 'The passwords do not match.';
    setErrors(n);
    if (!Object.keys(n).length) go('resetdone');
  };

  if (step === 'forgot') return (
    <Shell>
      <form onSubmit={sendLink} noValidate className="flex flex-col gap-8">
        <Heading title="Forgot your password?" text="Enter your email and we will send you a link to choose a new password." />
        <EmailField value={email} onChange={(v) => { setEmail(v); setErrors({}); }} error={errors.email} />
        <div className="flex flex-col gap-4">
          <DButton type="submit" variant="primary" className="w-full">Reset password</DButton>
          <DButton variant="ghost" onPress={() => go('signin')} className="w-full"><ArrowLeft className="size-4" aria-hidden="true" />Back</DButton>
        </div>
      </form>
    </Shell>
  );

  if (step === 'sent') return (
    <Shell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <MailCheck className="size-5 text-accent" aria-hidden="true" />
          <Heading title="Check your email" text={<>If this email is associated with an account, a password reset link is on its way to <span className="text-fg">{email}</span>.</>} />
        </div>
        <div className="flex flex-col gap-4">
          <DButton variant="primary" onPress={() => go('signin')} className="w-full">Back to sign in</DButton>
          <DButton variant="ghost" onPress={() => go('forgot')} className="w-full">Use a different email</DButton>
        </div>
      </div>
    </Shell>
  );

  if (step === 'code') return (
    <Shell>
      <form onSubmit={submitCode} noValidate className="flex flex-col gap-8">
        <Heading title="Enter your code" text="Enter the code from your authenticator app to continue." />
        <TextField value={code} onChange={(v) => { setCode(v); setErrors({}); }} isInvalid={!!errors.code} autoComplete="one-time-code" inputMode="numeric" className={fieldWrap}>
          <Label className={labelClass}>Generated code</Label>
          <Input className={cx(controlBase, 'h-8 pb-[2px] tabular-nums')} />
          {errors.code && <FieldError className={errorClass}>{errors.code}</FieldError>}
        </TextField>
        <DButton type="submit" variant="primary" className="w-full">Sign in</DButton>
      </form>
    </Shell>
  );

  if (step === 'instance') return (
    <Shell>
      <form onSubmit={submitInstance} noValidate className="flex flex-col gap-8">
        <Heading title="Select an instance" text={`We found ${INSTANCES.length} instances associated with your email. Select the one you want to review.`} />
        <div className="flex flex-col gap-2">
          <Listbox label="Instances" options={INSTANCES} value={instance} onChange={(k) => { setInstance(k as string[]); setErrors({}); }} />
          {errors.instance && <p role="alert" className={errorClass}>{errors.instance}</p>}
          <p className={helpClass}>Do not see the right instance? Contact your team admin to get access.</p>
        </div>
        <div className="flex flex-col gap-4">
          <DButton type="submit" variant="primary" className="w-full">Continue</DButton>
          <DButton variant="ghost" onPress={() => go('signin')} className="w-full">Cancel</DButton>
        </div>
      </form>
    </Shell>
  );

  if (step === 'loading') return (
    <Shell>
      <div className="flex flex-col gap-6" role="status">
        <Heading title="Loading instance" text="We are fetching the data. This may take up to a few minutes. Please do not close the window." />
        <span className="spinner text-accent" aria-hidden="true" />
      </div>
    </Shell>
  );

  if (step === 'reset') return (
    <Shell>
      <form onSubmit={submitReset} noValidate className="flex flex-col gap-8">
        <Heading title="Reset your password" text="Enter a new password below." />
        <div className="flex flex-col gap-6">
          <PasswordField label="New password" value={pw1} onChange={(v) => { setPw1(v); setErrors((e) => ({ ...e, pw1: undefined })); }} error={errors.pw1} autoComplete="new-password" />
          <PasswordField label="Confirm password" value={pw2} onChange={(v) => { setPw2(v); setErrors((e) => ({ ...e, pw2: undefined })); }} error={errors.pw2} autoComplete="new-password" />
        </div>
        <div className="flex flex-col gap-2 text-label text-fg-2">
          <p className="text-fg">Your password must:</p>
          <ul className="flex list-disc flex-col gap-1 pl-4">
            <li>be at least 12 characters long</li>
            <li>include two of: uppercase letters, lowercase letters, numbers, special characters</li>
            <li>be different from the default password and from your username</li>
            <li>not be simple or commonly used</li>
          </ul>
        </div>
        <DButton type="submit" variant="primary" className="w-full">Reset password</DButton>
      </form>
    </Shell>
  );

  if (step === 'resetdone') return (
    <Shell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <CircleCheck className="size-5 text-good" aria-hidden="true" />
          <Heading title="Password changed" text="You can now sign in with your new password." />
        </div>
        <DButton variant="primary" onPress={() => go('signin')} className="w-full">Sign in</DButton>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <form onSubmit={signIn} noValidate className="flex flex-col gap-8">
        <Heading title="Welcome back" text="Sign in to your account to continue." />
        {errors.form && <MessageBanner tone="error" title="Email or password do not match">Check them and try again, or reset your password.</MessageBanner>}
        <div className="flex flex-col gap-6">
          <EmailField value={email} onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }} error={errors.email} />
          <PasswordField label="Password" value={password} onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }} error={errors.password} placeholder="Enter your password" autoComplete="current-password" />
          <Link className={cx(linkClass, 'self-start')} onPress={() => go('forgot')}>Forgot password?</Link>
        </div>
        <DButton type="submit" variant="primary" className="w-full">Sign in</DButton>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 text-label text-fg-2" aria-hidden="true"><span className="h-px flex-1 bg-border" />Or<span className="h-px flex-1 bg-border" /></div>
          <p className="text-body text-fg-2">Use your organization's Single Sign-On to access your account.</p>
          <DButton variant="secondary" className="w-full">Sign in with Azure B2C SSO</DButton>
        </div>
      </form>
    </Shell>
  );
}
