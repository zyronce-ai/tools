import { motion } from "framer-motion";
import { Shield, AlertTriangle, Scale, Ban, Globe, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLang } from "@/lib/language-context";

const PrivacyPolicy = () => {
  const { lang } = useLang();

  if (lang === "en") {
    return (
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
            <Shield className="h-7 w-7 text-accent" />
            Privacy Policy & Disclaimer
          </h1>

          <div className="space-y-4">
            <Card className="p-6 border-border/50">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Disclaimer
              </h2>
              <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                <p>
                  This tool is developed <strong className="text-foreground">strictly for educational and personal use only</strong>.
                  We do not own, host, or claim any rights over the images, content, or data extracted from any website.
                </p>
                <p>
                  All images downloaded using this tool are the <strong className="text-foreground">intellectual property of their respective creators and owners</strong>.
                  We are <strong className="text-foreground">not responsible</strong> for any misuse, unauthorized reproduction, redistribution, or commercial exploitation of these images by the user.
                </p>
                <p>
                  The user assumes <strong className="text-foreground">full responsibility and legal liability</strong> for any copyright infringement,
                  trademark violation, or any other legal consequences arising from the use of this tool.
                </p>
                <p>
                  By using this tool, you acknowledge that you have <strong className="text-foreground">obtained proper authorization</strong> from the content owner
                  before downloading, sharing, or using any extracted content.
                </p>
              </div>
            </Card>

            <Card className="p-6 border-border/50">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <Scale className="h-5 w-5 text-primary" />
                Terms of Use
              </h2>
              <ul className="space-y-2 text-muted-foreground text-sm leading-relaxed list-disc list-inside">
                <li>Use this tool <strong className="text-foreground">only for lawful purposes</strong> in compliance with applicable local and international laws.</li>
                <li>Do <strong className="text-foreground">not use</strong> downloaded images for commercial purposes without obtaining explicit written consent from the original copyright holder.</li>
                <li>Do <strong className="text-foreground">not redistribute, resell, or sublicense</strong> any images or content extracted through this tool.</li>
                <li>The developers and operators of this tool shall <strong className="text-foreground">not be a party to any legal dispute</strong> arising from user actions.</li>
                <li>This tool only extracts <strong className="text-foreground">publicly accessible content</strong> and does not bypass any authentication, paywall, or access restriction.</li>
                <li>Any violation of these terms may result in <strong className="text-foreground">immediate termination of access</strong> to this tool without prior notice.</li>
              </ul>
            </Card>

            <Card className="p-6 border-border/50">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <Ban className="h-5 w-5 text-destructive" />
                Prohibited Activities
              </h2>
              <ul className="space-y-2 text-muted-foreground text-sm leading-relaxed list-disc list-inside">
                <li>Scraping or downloading copyrighted content without the owner's permission.</li>
                <li>Using extracted images to create <strong className="text-foreground">counterfeit product listings</strong> or misleading advertisements.</li>
                <li>Bulk downloading images for the purpose of <strong className="text-foreground">building competing databases or services</strong>.</li>
                <li>Using this tool to <strong className="text-foreground">harass, defame, or harm</strong> any individual or business.</li>
                <li>Attempting to circumvent rate limits, security measures, or access controls.</li>
              </ul>
            </Card>

            <Card className="p-6 border-border/50">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-accent" />
                Privacy Policy
              </h2>
              <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                <p>We fully respect your <strong className="text-foreground">privacy and data security</strong>.</p>
                <p>• We do <strong className="text-foreground">not collect, store, or share</strong> any personal data or browsing information.</p>
                <p>• URLs entered by you are used <strong className="text-foreground">solely for image extraction</strong> during the active session and are <strong className="text-foreground">never saved or logged</strong>.</p>
                <p>• We do <strong className="text-foreground">not sell, trade, or transfer</strong> any user data to third parties under any circumstances.</p>
                <p>• Authentication data is stored securely using <strong className="text-foreground">industry-standard encryption protocols</strong>.</p>
                <p>• No cookies or tracking mechanisms are used for advertising or analytics purposes.</p>
              </div>
            </Card>

            <Card className="p-6 border-border/50">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                <Globe className="h-5 w-5 text-primary" />
                Limitation of Liability
              </h2>
              <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                <p>
                  This tool is provided <strong className="text-foreground">"as is" without any warranty</strong>, express or implied.
                  The developers make no guarantees regarding the accuracy, availability, or reliability of the tool.
                </p>
                <p>
                  Under no circumstances shall the developers be liable for any <strong className="text-foreground">direct, indirect, incidental,
                  consequential, or punitive damages</strong> arising from the use or inability to use this tool.
                </p>
                <p>
                  The user agrees to <strong className="text-foreground">indemnify and hold harmless</strong> the developers from any claims,
                  damages, or legal proceedings resulting from the user's actions.
                </p>
              </div>
            </Card>

            <Card className="p-6 border-border/50 bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                By using this tool, you agree to all the terms and conditions stated above.
                <br />
                Created by <strong className="text-foreground">Chetan Parihar</strong> • © {new Date().getFullYear()} NayraTools. All rights reserved.
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  // Hindi/Hinglish version
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
          <Shield className="h-7 w-7 text-accent" />
          Privacy Policy & Disclaimer
        </h1>

        <div className="space-y-4">
          <Card className="p-6 border-border/50">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Disclaimer (अस्वीकरण)
            </h2>
            <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
              <p>
                यह tool सिर्फ <strong className="text-foreground">educational और personal use</strong> के लिए बनाया गया है।
                हम किसी भी website की images, content, या data के owner नहीं हैं।
              </p>
              <p>
                इस tool का उपयोग करके download की गई सभी images उनके <strong className="text-foreground">original creators/owners</strong> की 
                intellectual property हैं। हम इन images के किसी भी प्रकार के misuse, unauthorized distribution, 
                या commercial use के लिए <strong className="text-foreground">जिम्मेदार नहीं हैं।</strong>
              </p>
              <p>
                User इस tool का उपयोग <strong className="text-foreground">अपनी जिम्मेदारी</strong> पर करता है। 
                किसी भी copyright violation के लिए user स्वयं जिम्मेदार होगा।
              </p>
            </div>
          </Card>

          <Card className="p-6 border-border/50">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-primary" />
              Terms of Use (उपयोग की शर्तें)
            </h2>
            <ul className="space-y-2 text-muted-foreground text-sm leading-relaxed list-disc list-inside">
              <li>इस tool का उपयोग केवल <strong className="text-foreground">legal purposes</strong> के लिए करें।</li>
              <li>Download की गई images को <strong className="text-foreground">commercial purpose</strong> के लिए use न करें बिना original owner की permission के।</li>
              <li>किसी भी website की images को बिना permission <strong className="text-foreground">re-distribute</strong> न करें।</li>
              <li>इस tool के developers किसी भी <strong className="text-foreground">legal dispute</strong> में party नहीं होंगे।</li>
              <li>यह tool publicly available content को ही extract करता है।</li>
              <li>किसी भी प्रकार के <strong className="text-foreground">counterfeit listings</strong> या fake advertisements बनाने के लिए images का use करना सख्त मना है।</li>
            </ul>
          </Card>

          <Card className="p-6 border-border/50">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-accent" />
              Privacy Policy (गोपनीयता नीति)
            </h2>
            <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
              <p>
                हम आपकी <strong className="text-foreground">privacy</strong> का पूरा सम्मान करते हैं।
              </p>
              <p>
                • हम कोई भी <strong className="text-foreground">personal data collect, store, या share</strong> नहीं करते।
              </p>
              <p>
                • आपके द्वारा enter की गई URLs सिर्फ image extraction के लिए use होती हैं और <strong className="text-foreground">कहीं save नहीं</strong> होतीं।
              </p>
              <p>
                • हम किसी भी third-party को आपका data नहीं बेचते।
              </p>
              <p>
                • Authentication data securely stored है और industry-standard encryption use होता है।
              </p>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              इस tool का उपयोग करके आप ऊपर दी गई सभी शर्तों से सहमत होते हैं।
              <br />
              Created by <strong className="text-foreground">Chetan Parihar</strong> • © {new Date().getFullYear()} NayraTools
            </p>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
