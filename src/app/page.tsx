import { TranslationBox } from '@/components/TranslationBox';

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center justify-start pt-4 sm:pt-10 min-h-[70vh]">
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
        <TranslationBox />
      </div>
    </div>
  );
}
