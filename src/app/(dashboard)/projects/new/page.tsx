import { getUserLanguage } from '@/lib/session';
import { getDictionary } from '@/lib/dictionaries';
import { NewProjectForm } from '@/components/projects/NewProjectForm';

export default async function NewProjectPage() {
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    return <NewProjectForm dict={dict} />;
}
