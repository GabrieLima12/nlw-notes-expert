import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, MoreVertical, Maximize2 } from "lucide-react";
import { toast } from 'sonner';

interface NoteCardProps {
  note : {
    id: string;
    noteTitle: string;
    date: Date;
    content: string;
  }

  onNoteDeleted: (id: string) => void;
}

function download(content: string, noteTitle: string, type: string): void {
  const file = new Blob([content], { type: type });
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = noteTitle;
  a.click();
  URL.revokeObjectURL(url);
}

export function NoteCard( { note, onNoteDeleted } : NoteCardProps ) {

  function handleBaixarNota() {
    try {
      download(note.content, note.noteTitle, 'text/plain');
      toast.success("Arquivo baixado com sucesso!");
    } catch {
      toast.error("Erro ao baixar arquivo.");
    }
  }

  return (
    <Dialog.Root>
      <div className="rounded-md text-left flex flex-col bg-slate-800 p-5 gap-3 overflow-hidden relative outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400" >
        <div className="flex justify-between" >
          <span className="text-sm font-medium text-slate-200">
            {formatDistanceToNow(note.date, {
              locale: ptBR,
              addSuffix: true
            })}
          </span>

          <div className="flex gap-2" >
            <Dialog.Trigger>
              <Maximize2 size={14} />
            </Dialog.Trigger>
            
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="outline-none" >
                <MoreVertical size={15} />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  align="end"
                  className="bg-slate-700 rounded-md p-1 mt-1 outline-none will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=bottom]:animate-slideUpAndFade" >
                  <DropdownMenu.Item>
                    <button 
                      onClick={handleBaixarNota}
                      className="outline-none" >
                      Baixar nota
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        <h3>
            {note.noteTitle}
        </h3>

        <p className="text-sm leading-6 text-slate-300">
          {note.content}
        </p>

        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-black/0 pointer-events-none" />
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/60" />
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none" >
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100" >
            <X className="size-5" />
          </Dialog.Close>
          <div className="flex flex-1 flex-col gap-3 p-5" >
            <span className="text-sm font-medium text-slate-200">
              {formatDistanceToNow(note.date, {
                locale: ptBR,
                addSuffix: true
              })}
            </span>
            <h3>
              {note.noteTitle}
            </h3>
            <p className="text-sm leading-6 text-slate-300">
              {note.content}
            </p>
          </div>

          <button
            onClick={() => { 
              onNoteDeleted(note.id);
              toast.success("Nota apagada com sucesso!");
            }}
            className="w-full bg-slate-800 py-4 text-center text-sm text-slate-300 font-medium outline-none group"
            type="button"
          >
            Deseja <span className="text-red-400 group-hover:underline">apagar essa nota</span>?
          </button>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};