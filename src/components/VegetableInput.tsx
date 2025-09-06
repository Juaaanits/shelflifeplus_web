import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

export interface Vegetable {
  id: string;
  name: string;
  quantity: number;
  ethyleneProduction: 'low' | 'medium' | 'high';
  ethyleneSensitivity: 'low' | 'medium' | 'high';
  idealTemp: { min: number; max: number };
  shelfLife: number; // days
}

const VEGETABLE_DATABASE: Record<string, Omit<Vegetable, 'id' | 'quantity'>> = {
  'Carrots': { name: 'Carrots', ethyleneProduction: 'low', ethyleneSensitivity: 'medium', idealTemp: { min: 0, max: 2 }, shelfLife: 21 },
  'Cabbage': { name: 'Cabbage', ethyleneProduction: 'low', ethyleneSensitivity: 'medium', idealTemp: { min: 0, max: 2 }, shelfLife: 20 },
  'Broccoli': { name: 'Broccoli', ethyleneProduction: 'low', ethyleneSensitivity: 'high', idealTemp: { min: 0, max: 2 }, shelfLife: 7 },
  'Cauliflower': { name: 'Cauliflower', ethyleneProduction: 'low', ethyleneSensitivity: 'high', idealTemp: { min: 0, max: 2 }, shelfLife: 10 },
  'Lettuce': { name: 'Lettuce', ethyleneProduction: 'low', ethyleneSensitivity: 'high', idealTemp: { min: 0, max: 2 }, shelfLife: 10 },
  'Celery': { name: 'Celery', ethyleneProduction: 'low', ethyleneSensitivity: 'high', idealTemp: { min: 0, max: 2 }, shelfLife: 14 },
  'Chinese cabbage': { name: 'Chinese cabbage', ethyleneProduction: 'low', ethyleneSensitivity: 'medium', idealTemp: { min: 0, max: 2 }, shelfLife: 14 },
  'Eggplant': { name: 'Eggplant', ethyleneProduction: 'low', ethyleneSensitivity: 'high', idealTemp: { min: 10, max: 12 }, shelfLife: 7 },
  'Tomatoes': { name: 'Tomatoes', ethyleneProduction: 'high', ethyleneSensitivity: 'medium', idealTemp: { min: 12, max: 15 }, shelfLife: 7 },
  'Okra': { name: 'Okra', ethyleneProduction: 'low', ethyleneSensitivity: 'high', idealTemp: { min: 7, max: 10 }, shelfLife: 5 },
  'Ampalaya': { name: 'Ampalaya', ethyleneProduction: 'low', ethyleneSensitivity: 'medium', idealTemp: { min: 10, max: 12 }, shelfLife: 5 },
  'Sitaw': { name: 'Sitaw', ethyleneProduction: 'low', ethyleneSensitivity: 'high', idealTemp: { min: 7, max: 10 }, shelfLife: 5 },
  'Patola': { name: 'Patola', ethyleneProduction: 'low', ethyleneSensitivity: 'medium', idealTemp: { min: 10, max: 12 }, shelfLife: 7 },
  'Kalabasa': { name: 'Kalabasa', ethyleneProduction: 'low', ethyleneSensitivity: 'low', idealTemp: { min: 10, max: 12 }, shelfLife: 30 },
  'Pechay': { name: 'Pechay', ethyleneProduction: 'low', ethyleneSensitivity: 'medium', idealTemp: { min: 0, max: 2 }, shelfLife: 7 },
  'Potatoes': { name: 'Potatoes', ethyleneProduction: 'low', ethyleneSensitivity: 'low', idealTemp: { min: 4, max: 8 }, shelfLife: 60 },
  'Onions': { name: 'Onions', ethyleneProduction: 'low', ethyleneSensitivity: 'low', idealTemp: { min: 0, max: 4 }, shelfLife: 90 },
  'Peppers': { name: 'Peppers', ethyleneProduction: 'low', ethyleneSensitivity: 'medium', idealTemp: { min: 7, max: 10 }, shelfLife: 14 },
};

interface VegetableInputProps {
  vegetables: Vegetable[];
  onVegetablesChange: (vegetables: Vegetable[]) => void;
}

export function VegetableInput({ vegetables, onVegetablesChange }: VegetableInputProps) {
  const [selectedVegetable, setSelectedVegetable] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetVegId, setTargetVegId] = useState<string | null>(null);

  const addVegetable = () => {
    if (!selectedVegetable || vegetables.find(v => v.name === selectedVegetable)) return;

    const vegetableData = VEGETABLE_DATABASE[selectedVegetable];
    if (!vegetableData) return;

    const newVegetable: Vegetable = {
      id: Math.random().toString(36).substr(2, 9),
      quantity: 1,
      ...vegetableData
    };

    onVegetablesChange([...vegetables, newVegetable]);
    setSelectedVegetable('');
  };

  const updateQuantity = (id: string, change: number) => {
    onVegetablesChange(
      vegetables.map(v =>
        v.id === id ? { ...v, quantity: Math.max(0, v.quantity + change) } : v
      ).filter(v => v.quantity > 0)
    );
  };

  const handleDecrement = (id: string) => {
    const veg = vegetables.find(v => v.id === id);
    if (!veg) return;
    if (veg.quantity <= 1) {
      setTargetVegId(id);
      setConfirmOpen(true);
      return;
    }
    updateQuantity(id, -1);
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-card to-fresh-green-light/20 border-fresh-green/20">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Add Vegetables to Load</h3>

        <div className="flex gap-2 mb-4">
          <select
            value={selectedVegetable}
            onChange={(e) => setSelectedVegetable(e.target.value)}
            className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select a vegetable...</option>
            {Object.keys(VEGETABLE_DATABASE)
              .filter(name => !vegetables.find(v => v.name === name))
              .map(name => (
                <option key={name} value={name}>{name}</option>
              ))
            }
          </select>
          <Button
            onClick={addVegetable}
            disabled={!selectedVegetable || vegetables.find(v => v.name === selectedVegetable) !== undefined}
            className="bg-fresh-green hover:bg-fresh-green-dark text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {vegetables.map((vegetable) => (
            <div key={vegetable.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
              <span className="font-medium text-foreground">{vegetable.name}</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleDecrement(vegetable.id)} className="w-8 h-8 p-0">
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-foreground">{vegetable.quantity}</span>
                <Button size="sm" variant="outline" onClick={() => updateQuantity(vegetable.id, 1)} className="w-8 h-8 p-0">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirm removal dialog when quantity would drop to 0 */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove vegetable from load?</AlertDialogTitle>
            <AlertDialogDescription>
              Quantities cannot be less than 0. Setting quantity to 0 will remove this item from your load.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (targetVegId) {
                  updateQuantity(targetVegId, -1);
                }
                setConfirmOpen(false);
                setTargetVegId(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
