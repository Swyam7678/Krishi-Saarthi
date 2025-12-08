import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";
import { toast } from "sonner";

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function CompleteProfileModal({ isOpen, onClose, user }: CompleteProfileModalProps) {
  const { t } = useLanguage();
  const updateUser = useMutation(api.users.updateUser);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateUser({
        name: formData.get("name") as string,
        phoneNumber: formData.get("phoneNumber") as string,
        farmLocation: formData.get("farmLocation") as string,
        farmSize: formData.get("farmSize") as string,
      });
      toast.success(t('success'));
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide your farm details to get personalized recommendations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" defaultValue={user?.name || ""} required placeholder="Enter your full name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" name="phoneNumber" defaultValue={user?.phoneNumber || ""} required placeholder="Enter your phone number" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="farmLocation">Farm Location</Label>
            <Input id="farmLocation" name="farmLocation" defaultValue={user?.farmLocation || user?.location || ""} required placeholder="City, State" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="farmSize">Total Land Area</Label>
            <Input id="farmSize" name="farmSize" defaultValue={user?.farmSize || ""} required placeholder="e.g. 5 Acres" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('loading') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
