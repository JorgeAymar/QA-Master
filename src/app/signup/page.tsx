import { getDictionary } from '@/lib/dictionaries';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
    const dict = getDictionary('es'); // Default to Spanish for unauthenticated
    return <SignupForm dict={dict} />;
}
