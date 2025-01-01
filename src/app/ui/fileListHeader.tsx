'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronUp } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sortOptions } from './fileListWrapper';

export default function FileListHeader({ pathParts, fetchFiles, sortBy, setSortBy, sortOrder, setSortOrder }: { pathParts: string[], fetchFiles: () => Promise<void>, sortBy: typeof sortOptions[number], setSortBy: Dispatch<SetStateAction<typeof sortOptions[number]>>, sortOrder: boolean, setSortOrder: Dispatch<SetStateAction<boolean>> }) {
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newDirectoryName, setNewDirectoryName] = useState("")

    const handleAddDirectory = async (name: string) => {
        const res = await fetch(`/api/dashboard/${pathParts.map(encodeURIComponent).join('/')}/${encodeURIComponent(name)}?folder=true`, {
            method: 'POST',
            cache: 'no-cache',
        });

        if (res.status == 200) {
            toast({
                title: `Success!`,
                description: `The folder "${name}" has been created successfully.`,
            });

            setIsDialogOpen(false);
            setNewDirectoryName("");
            return fetchFiles();
        }

        const json = await res.json();

        toast({
            title: `Could not create "${name}".`,
            description: `${json?.error || 'No error message'}`,
            variant: 'destructive',
        })
    }

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
            <h2 className="text-xl font-semibold text-white">Your Files</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select defaultValue={sortBy} onValueChange={(value: string) => setSortBy(value as (typeof sortOptions)[number])}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-gray-800 text-white border-gray-700 focus:ring-0 focus:ring-offset-0">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            {sortOptions.map(option =>
                                <SelectItem key={option} value={option} className="text-white focus:bg-gray-700 focus:text-white">{option.charAt(0).toUpperCase() + option.slice(1)}</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortOrder(!sortOrder)}
                        className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:text-gray-100 transition-all duration-200 ease-in-out min-w-[40px]"
                    >
                        <div className={`transform transition-transform duration-200${sortOrder ? ' rotate-180' : ''}`}>
                            <ChevronUp className="h-4 w-4" />
                        </div>
                    </Button>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:text-gray-100 transition-colors nofocus"
                        >
                            Add Directory
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700 mx-4">
                        <DialogHeader>
                            <DialogTitle>Create New Directory</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Enter a name for the new directory.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newDirectoryName}
                                    onChange={(e) => setNewDirectoryName(e.target.value)}
                                    className="col-span-3 bg-gray-700 border-gray-600 text-white"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => handleAddDirectory(newDirectoryName)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Create Directory
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}