import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  q: string;
  a: string;
}

export function FAQ({ title, items, id }: { title: string; items: FAQItem[]; id: string }) {
  return (
    <section className="mt-12 border-t border-[#2A2A38] pt-10">
      <h2 className="text-xl font-bold text-[#F1F1F5] mb-6">{title}</h2>
      <Accordion type="single" collapsible className="w-full max-w-3xl">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`${id}-${i}`}>
            <AccordionTrigger className="text-left text-sm font-medium text-[#C8C8D0] hover:text-[#F1F1F5]">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-[#8888A0] leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}