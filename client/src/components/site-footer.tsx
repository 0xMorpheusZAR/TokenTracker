export default function SiteFooter() {
  return (
    <footer className="w-full py-4 px-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-lg border-t border-gray-700/50">
      <div className="container mx-auto text-center">
        <p className="text-sm text-gray-400">
          Created by{" "}
          <a 
            href="https://x.com/0xMorpheusXBT" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            @0xMorpheusXBT
          </a>
        </p>
      </div>
    </footer>
  );
}