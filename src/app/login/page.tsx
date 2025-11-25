import { getDictionary } from '@/lib/dictionaries';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
    const dict = getDictionary('es'); // Default to Spanish for unauthenticated
    return <LoginForm dict={dict} />;
}
