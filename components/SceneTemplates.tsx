
import React from 'react';

interface SceneTemplate {
  id: string;
  name: string;
  prompt: string;
  bgColor: string;
  textColor: string;
}

const templates: SceneTemplate[] = [
  {
    id: 'minimalist',
    name: 'Studio tối giản',
    prompt: 'A minimalist studio setting with a clean, light gray background and soft, diffused side lighting. The product sits on a simple white pedestal.',
    bgColor: 'bg-gray-200',
    textColor: 'text-gray-700'
  },
  {
    id: 'garden',
    name: 'Vườn ngoài trời',
    prompt: 'An outdoor garden scene during golden hour, with the product resting on a mossy stone surrounded by blurred green foliage and soft sunlight filtering through the leaves.',
    bgColor: 'bg-green-200',
    textColor: 'text-green-800'
  },
  {
    id: 'cafe',
    name: 'Quán cà phê',
    prompt: 'A cozy cafe corner with a warm, inviting atmosphere. The product is placed on a dark wood table, next to a steaming cup of coffee and a blurred background of a bookshelf.',
    bgColor: 'bg-amber-200',
    textColor: 'text-amber-800'
  },
  {
    id: 'marble',
    name: 'Đá cẩm thạch',
    prompt: 'An elegant and luxurious scene with the product placed on a polished white marble surface with subtle grey veining. The background is a soft, out-of-focus neutral color.',
    bgColor: 'bg-slate-200',
    textColor: 'text-slate-700'
  },
  {
    id: 'beach',
    name: 'Bãi biển',
    prompt: 'A bright, tropical beach scene. The product rests on clean white sand, with a turquoise ocean and gentle waves in the blurred background under a clear blue sky.',
    bgColor: 'bg-cyan-200',
    textColor: 'text-cyan-800'
  },
  {
    id: 'forest',
    name: 'Trong rừng',
    prompt: 'A mystical forest floor setting. The product is placed on a dark, rich soil with small ferns and a sunbeam piercing through the dense canopy above.',
    bgColor: 'bg-emerald-800',
    textColor: 'text-emerald-100'
  }
];

interface SceneTemplatesProps {
  onTemplateSelect: (prompt: string) => void;
}

export const SceneTemplates: React.FC<SceneTemplatesProps> = ({ onTemplateSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onTemplateSelect(template.prompt)}
          className="group text-left border border-gray-200 rounded-lg hover:shadow-md hover:border-brand transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand/50 bg-white"
        >
          <div className={`aspect-[4/3] w-full ${template.bgColor} rounded-t-lg flex items-center justify-center p-2`}>
            {/* Minimalist icon for demonstration */}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${template.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="p-2">
            <p className="text-sm font-semibold text-gray-700 group-hover:text-brand transition-colors">{template.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
};
