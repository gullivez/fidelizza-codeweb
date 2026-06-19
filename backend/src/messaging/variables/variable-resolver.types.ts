export interface VariableResolverContext {
  customer: {
    name: string;
  };
  restaurant: {
    name: string;
  };
}

export interface VariableDefinition {
  key: string;
  label: string;
  category: 'contact' | 'restaurant';
  resolve: (ctx: VariableResolverContext) => string;
}
