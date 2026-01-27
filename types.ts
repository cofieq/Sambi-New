
export type MovementType = 'RESTOCK' | 'DEDUCTION' | 'ADJUSTMENT' | 'INITIAL' | 'BATCH_PRODUCTION';
export type IngredientType = 'RAW' | 'PREPARED';

export interface StockHistory {
  id: string;
  ingredientId: string;
  ingredientName: string;
  type: MovementType;
  amount: number;
  balanceAfter: number;
  timestamp: Date;
  note?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  itemType: IngredientType; // RAW (Bahan Utama) or PREPARED (Hasil Batch)
}

export interface RecipeItem {
  ingredientId: string;
  amount: number;
}

export interface BatchRecipe {
  id: string;
  targetIngredientId: string; // The ID of the Ingredient this batch produces
  recipe: RecipeItem[];
  yieldAmount: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  recipe: RecipeItem[];
}

export interface SalesLog {
  id: string;
  menuId: string;
  menuName: string;
  quantity: number;
  timestamp: Date;
}
