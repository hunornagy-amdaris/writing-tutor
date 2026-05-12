import { EssayTutorClient, EssayTutorProvider } from '@/modules/essay-tutor';

export default function HomePage() {
  return (
    <EssayTutorProvider>
      <EssayTutorClient />
    </EssayTutorProvider>
  );
}
