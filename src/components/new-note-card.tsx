import * as Dialog from "@radix-ui/react-dialog";
import { X, Undo2 } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
  onNoteCreated: (content: string, noteTitle: string) => void;
}

let speechRecognitionAPI : SpeechRecognition | null = null;

export function NewNoteCard( { onNoteCreated } : NewNoteCardProps ) {

  const [isRecording, setIsRecording] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [content, setContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");

  function handleStartEditor() {
    setShouldShowOnboarding(false); 
  }

  function handleNoteTitle(event: ChangeEvent<HTMLInputElement>) {
    setNoteTitle(event.target.value);
  }

  function handleSetShouldShowBoardingAndClean() {
    setNoteTitle('');
    setContent('');
    setShouldShowOnboarding(true);
    setIsRecording(false);
    if (speechRecognitionAPI !== null) {
      speechRecognitionAPI.abort();
    }
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()
    
    if (content === '' || noteTitle === '') return;

    onNoteCreated(content, noteTitle);
    toast.success("Nota criada com sucesso!")

    setShouldShowOnboarding(true);
    setContent('');
    setNoteTitle('');
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert('Infelizmente seu navegador não suporta a API de gravação!');
      return
    };

    setIsRecording(true);
    setShouldShowOnboarding(false);

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognitionAPI = new SpeechRecognitionAPI();

    speechRecognitionAPI.lang= 'pt-BR';
    speechRecognitionAPI.continuous = true;
    speechRecognitionAPI.maxAlternatives = 1;
    speechRecognitionAPI.interimResults = true;
    
    speechRecognitionAPI.onresult = (event) => {
      const trascription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, '');

      setContent(trascription);
    };

    speechRecognitionAPI.onerror = (event) => {
      if (event.error === "aborted") {
        toast.error("Gravação abortada!")
      } else {
        console.error(event.error);
      }
    };

    speechRecognitionAPI.start();
  }

  function handleStopRecording() {
    setIsRecording(false);

    if (speechRecognitionAPI !== null) {
      speechRecognitionAPI.stop();
    };

  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md text-left flex flex-col bg-slate-700 p-5 gap-3 overflow-hidden relative outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/60" />
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none" >
          {shouldShowOnboarding === false &&
            <div>
              <Undo2 
                size={30}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-slate-100 cursor-pointer"
                onClick={handleSetShouldShowBoardingAndClean} />
            </div>
          }
          <Dialog.Close 
            onClick={handleSetShouldShowBoardingAndClean}
            className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100" >
            <X className="size-5" />
          </Dialog.Close>
          <form className="flex flex-1 flex-col" >
            <div className="flex flex-1 flex-col gap-3 p-5" >
              <span className="text-sm font-medium text-slate-200">
                Adicionar nota
              </span>

              { shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-300">
                  Comece <button type="button" onClick={handleStartRecording} className="font-medium text-lime-400 hover:underline">gravando uma nota</button> em audio em audio ou se prefirir <button type="button" onClick={handleStartEditor} className="font-medium text-lime-400 hover:underline">utilize apenas texto</button>.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    className="w-full bg-transparent text-2xl font-semibold tracking-tight placeholder:text-slate-400 outline-none"
                    placeholder="Digite o título da nota..."
                    value={noteTitle}
                    onChange={handleNoteTitle}
                  />
                 <textarea 
                  autoFocus
                  placeholder="Digite o conteúdo da nota..."
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                  value={content}
                  onChange={handleContentChange}
                  >
                  </textarea>
                </div>
                
              )}
            </div>

            {isRecording
              ? 
                <button
                  onClick={handleStopRecording}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 font-medium outline-none hover:text-slate-100"
                  type="button"
                  >
                    <div className="size-3 bg-red-500 rounded-full animate-pulse"/>
                    Gravando! (clique p/ interromper)
                </button>
              : <button
                  onClick={handleSaveNote}
                  className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 font-medium outline-none hover:bg-lime-500"
                  type="button"
                  >
                  Salvar nota
                </button>
             }
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};