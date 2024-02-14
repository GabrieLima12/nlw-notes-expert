import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void;
}

let speechRecognitionAPI : SpeechRecognition | null = null;

export function NewNoteCard( { onNoteCreated } : NewNoteCardProps ) {

  const [isRecording, setIsRecording] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [content, setContent] = useState("");

  function handleStartEditor() {
    setShouldShowOnboarding(false); 
  }

  function hadleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);

    if (event.target.value == "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()
    
    if (content === '') return;

    onNoteCreated(content);
    toast.success("Nota criada com sucesso!")

    setShouldShowOnboarding(true);
    setContent('');
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
      console.error(event);
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
        <Dialog.Content className="fixed overflow-hidden left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[640px] w-full h-[60vh] bg-slate-700 rounded-md flex flex-col outline-none" >
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100" >
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
                <textarea 
                autoFocus
                className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                value={content}
                onChange={hadleContentChange}
                >
                </textarea>
              )}
            </div>

            {isRecording
              ? <button
                  onClick={handleStopRecording}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 font-medium outline-none hover:text-slate-100"
                  type="button"
                  >
                    <div className="size-3 bg-red-500 rounded-full animate-pulse"/>
                    Gravando! (clique p/ interroper)
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