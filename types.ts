
export type MovementType = 'RESTOCK' | 'DEDUCTION' | 'ADJUSTMENT' | 'INITIAL' | 'BATCH_PRODUCTION';

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
  isBatch?: boolean; // New flag to identify if this item is a batch
}

export interface RecipeItem {
  ingredientId: string;
  amount: number;
}

export interface BatchRecipe {
  id: string;
  targetIngredientId: string; // The ID of the Ingredient this batch produces
  recipe: RecipeItem[];
  yieldAmount: number; // How much of the target ingredient is produced (e.g., 1000g of Sauce)
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
