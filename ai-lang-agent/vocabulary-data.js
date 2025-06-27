// 50 Essential GMAT Vocabulary Words
const vocabulary = [
    {
        word: "ubiquitous", 
        pronunciation: "/yuˈbɪkwɪtəs/", 
        definition: "present, appearing, or found everywhere",
        example: "Smartphones have become ubiquitous in modern society.", 
        synonyms: "omnipresent, pervasive, widespread",
        etymology: "From Latin 'ubique' meaning 'everywhere'", 
        scenario: "Coffee shops are ubiquitous in Seattle - there's one on every corner!",
        imagePrompt: "A photorealistic image showing smartphones, WiFi symbols, and digital screens visible everywhere in a modern city street scene"
    },
    {
        word: "ambiguous", 
        pronunciation: "/æmˈbɪɡjuəs/", 
        definition: "open to more than one interpretation; unclear",
        example: "The contract language was ambiguous, leading to disputes.", 
        synonyms: "vague, unclear, equivocal",
        etymology: "From Latin 'ambiguus' meaning 'doubtful'", 
        scenario: "Her ambiguous email left the team unsure about the deadline.",
        imagePrompt: "A person looking confused at a road sign with multiple arrows pointing in different directions"
    },
    {
        word: "scrutinize", 
        pronunciation: "/ˈskruːtəˌnaɪz/", 
        definition: "examine or inspect closely and thoroughly",
        example: "Auditors will scrutinize the financial records.", 
        synonyms: "examine, inspect, analyze",
        etymology: "From Latin 'scrutari' meaning 'to search'", 
        scenario: "The hiring manager will scrutinize every resume carefully.",
        imagePrompt: "A person with a magnifying glass examining documents closely on a desk"
    },
    {
        word: "vindicate", 
        pronunciation: "/ˈvɪndɪˌkeɪt/", 
        definition: "clear someone of blame; show to be right",
        example: "New evidence vindicated the accused.", 
        synonyms: "exonerate, justify, absolve",
        etymology: "From Latin 'vindicare' meaning 'to claim'", 
        scenario: "The DNA test vindicated the wrongly convicted man.",
        imagePrompt: "A person walking free from a courthouse with arms raised in victory"
    },
    {
        word: "plausible", 
        pronunciation: "/ˈplɔːzəbəl/", 
        definition: "seeming reasonable or probable",
        example: "Her explanation seemed plausible to the jury.", 
        synonyms: "believable, credible, feasible",
        etymology: "From Latin 'plausibilis' meaning 'deserving applause'", 
        scenario: "The CEO's turnaround plan sounds plausible to investors.",
        imagePrompt: "A businessperson presenting a convincing chart to an attentive audience"
    },
    {
        word: "aggregate", 
        pronunciation: "/ˈæɡrɪɡət/", 
        definition: "a whole formed by combining parts; total",
        example: "The aggregate score determined the winner.", 
        synonyms: "total, sum, collective",
        etymology: "From Latin 'aggregare' meaning 'to flock together'", 
        scenario: "The aggregate data shows a clear market trend.",
        imagePrompt: "Multiple colorful puzzle pieces coming together to form a complete picture"
    },
    {
        word: "substantiate", 
        pronunciation: "/səbˈstænʃiˌeɪt/", 
        definition: "provide evidence to support or prove",
        example: "Please substantiate your claims with data.", 
        synonyms: "verify, confirm, validate",
        etymology: "From Latin 'substantia' meaning 'substance'", 
        scenario: "The research substantiated the hypothesis with clear results.",
        imagePrompt: "A stack of documents and evidence files supporting a legal case"
    },
    {
        word: "conducive", 
        pronunciation: "/kənˈduːsɪv/", 
        definition: "making a situation or outcome likely or possible",
        example: "A quiet environment is conducive to studying.", 
        synonyms: "favorable, helpful, beneficial",
        etymology: "From Latin 'conducere' meaning 'to lead together'", 
        scenario: "The new policy is conducive to employee productivity.",
        imagePrompt: "A peaceful library study area with perfect lighting and comfortable seating"
    },
    {
        word: "mitigate", 
        pronunciation: "/ˈmɪtɪˌɡeɪt/", 
        definition: "make less severe, serious, or painful",
        example: "The company took steps to mitigate the risks.", 
        synonyms: "reduce, alleviate, diminish",
        etymology: "From Latin 'mitigare' meaning 'to soften'", 
        scenario: "The insurance policy helps mitigate financial losses.",
        imagePrompt: "A protective umbrella shielding people from a storm"
    },
    {
        word: "commensurate", 
        pronunciation: "/kəˈmenʃərət/", 
        definition: "corresponding in size or degree; proportionate",
        example: "The salary is commensurate with experience.", 
        synonyms: "proportional, equivalent, matching",
        etymology: "From Latin 'com-' and 'mensura' meaning 'measured together'", 
        scenario: "The punishment should be commensurate with the crime.",
        imagePrompt: "A balanced scale showing equal weights on both sides"
    },
    {
        word: "exemplary", 
        pronunciation: "/ɪɡˈzempləri/", 
        definition: "serving as a desirable model; outstanding",
        example: "Her exemplary work earned her a promotion.", 
        synonyms: "outstanding, exceptional, model",
        etymology: "From Latin 'exemplum' meaning 'example'", 
        scenario: "The student's exemplary behavior impressed all teachers.",
        imagePrompt: "A gold star trophy or medal representing excellence and achievement"
    },
    {
        word: "prevalent", 
        pronunciation: "/ˈprevələnt/", 
        definition: "widespread in a particular area or time",
        example: "Flu is prevalent during winter months.", 
        synonyms: "common, widespread, dominant",
        etymology: "From Latin 'praevalere' meaning 'to be stronger'", 
        scenario: "Remote work has become prevalent in tech companies.",
        imagePrompt: "A map showing widespread dots or coverage across a region"
    },
    {
        word: "contingent", 
        pronunciation: "/kənˈtɪndʒənt/", 
        definition: "subject to chance; dependent on something else",
        example: "The deal is contingent on board approval.", 
        synonyms: "dependent, conditional, subject to",
        etymology: "From Latin 'contingere' meaning 'to touch'", 
        scenario: "Your bonus is contingent on meeting sales targets.",
        imagePrompt: "A chain link showing connection and dependency between elements"
    },
    {
        word: "arbitrary", 
        pronunciation: "/ˈɑːrbɪˌtreri/", 
        definition: "based on random choice rather than reason",
        example: "The decision seemed arbitrary and unfair.", 
        synonyms: "random, capricious, unreasonable",
        etymology: "From Latin 'arbitrarius' meaning 'depending on will'", 
        scenario: "The arbitrary deadline created unnecessary stress.",
        imagePrompt: "A person randomly throwing darts at a board with eyes closed"
    },
    {
        word: "reciprocal", 
        pronunciation: "/rɪˈsɪprəkəl/", 
        definition: "given, felt, or done in return; mutual",
        example: "They have a reciprocal trade agreement.", 
        synonyms: "mutual, shared, corresponding",
        etymology: "From Latin 'reciprocus' meaning 'returning'", 
        scenario: "Trust in relationships should be reciprocal.",
        imagePrompt: "Two people shaking hands in a gesture of mutual agreement"
    },
    {
        word: "inherent", 
        pronunciation: "/ɪnˈhɪrənt/", 
        definition: "existing as a basic or permanent part",
        example: "Risk is inherent in any investment.", 
        synonyms: "intrinsic, built-in, natural",
        etymology: "From Latin 'inhaerere' meaning 'to stick in'", 
        scenario: "Creativity is inherent in all human beings.",
        imagePrompt: "DNA double helix representing something built into the core structure"
    },
    {
        word: "redundant", 
        pronunciation: "/rɪˈdʌndənt/", 
        definition: "not needed; superfluous",
        example: "The software made manual processes redundant.", 
        synonyms: "unnecessary, superfluous, excess",
        etymology: "From Latin 'redundare' meaning 'to overflow'", 
        scenario: "The backup systems aren't redundant - they're essential.",
        imagePrompt: "Multiple identical keys showing unnecessary duplication"
    },
    {
        word: "tangible", 
        pronunciation: "/ˈtændʒəbəl/", 
        definition: "perceptible by touch; clear and definite",
        example: "We need tangible results, not just promises.", 
        synonyms: "concrete, real, substantial",
        etymology: "From Latin 'tangere' meaning 'to touch'", 
        scenario: "The new strategy produced tangible improvements.",
        imagePrompt: "Hands touching a solid, real object like a stone or wooden block"
    },
    {
        word: "discern", 
        pronunciation: "/dɪˈsɜːrn/", 
        definition: "perceive or recognize clearly",
        example: "It's hard to discern truth from fiction online.", 
        synonyms: "distinguish, detect, recognize",
        etymology: "From Latin 'discernere' meaning 'to separate'", 
        scenario: "Good managers can discern talent in their employees.",
        imagePrompt: "A person using binoculars to see clearly into the distance"
    },
    {
        word: "pragmatic", 
        pronunciation: "/præɡˈmætɪk/", 
        definition: "dealing with things practically rather than ideally",
        example: "We need a pragmatic approach to this problem.", 
        synonyms: "practical, realistic, sensible",
        etymology: "From Greek 'pragma' meaning 'deed'", 
        scenario: "Her pragmatic solution saved both time and money.",
        imagePrompt: "A person choosing practical tools over fancy but impractical ones"
    },
    {
        word: "fortuitous", 
        pronunciation: "/fɔːrˈtuːɪtəs/", 
        definition: "happening by chance, especially in a lucky way",
        example: "Their meeting was entirely fortuitous.", 
        synonyms: "accidental, chance, serendipitous",
        etymology: "From Latin 'fortuitus' meaning 'happening by chance'", 
        scenario: "The fortuitous discovery led to a breakthrough.",
        imagePrompt: "Two paths crossing unexpectedly in a beautiful garden setting"
    },
    {
        word: "consensus", 
        pronunciation: "/kənˈsensəs/", 
        definition: "general agreement among a group",
        example: "The team reached consensus on the new strategy.", 
        synonyms: "agreement, accord, unity",
        etymology: "From Latin 'consentire' meaning 'to agree'", 
        scenario: "Building consensus takes time but ensures buy-in.",
        imagePrompt: "Multiple hands coming together in the center of a circle"
    },
    {
        word: "delineate", 
        pronunciation: "/dɪˈlɪniˌeɪt/", 
        definition: "describe or portray precisely",
        example: "Please delineate your responsibilities clearly.", 
        synonyms: "outline, define, describe",
        etymology: "From Latin 'delineare' meaning 'to sketch out'", 
        scenario: "The contract delineates each party's obligations.",
        imagePrompt: "A detailed architectural blueprint or map with clear boundaries"
    },
    {
        word: "juxtapose", 
        pronunciation: "/ˈdʒʌkstəˌpoʊz/", 
        definition: "place side by side for comparison",
        example: "The report juxtaposes old and new methods.", 
        synonyms: "compare, contrast, place together",
        etymology: "From Latin 'juxta' meaning 'near' and 'ponere' meaning 'to place'", 
        scenario: "The artist juxtaposed modern and classical elements.",
        imagePrompt: "Two contrasting images placed side by side for comparison"
    },
    {
        word: "comprehensive", 
        pronunciation: "/ˌkɑːmprɪˈhensɪv/", 
        definition: "complete and including everything necessary",
        example: "We need a comprehensive review of policies.", 
        synonyms: "complete, thorough, extensive",
        etymology: "From Latin 'comprehendere' meaning 'to grasp'", 
        scenario: "The comprehensive report covered all aspects.",
        imagePrompt: "A complete puzzle with all pieces perfectly fitted together"
    },
    {
        word: "innovation", 
        pronunciation: "/ˌɪnəˈveɪʃən/", 
        definition: "a new method, idea, or product",
        example: "The company is known for technological innovation.", 
        synonyms: "invention, breakthrough, novelty",
        etymology: "From Latin 'innovare' meaning 'to renew'", 
        scenario: "Innovation drives competitive advantage in business.",
        imagePrompt: "A bright lightbulb surrounded by gears and modern technology"
    },
    {
        word: "paradigm", 
        pronunciation: "/ˈpærəˌdaɪm/", 
        definition: "a typical example or pattern of something",
        example: "The internet created a new business paradigm.", 
        synonyms: "model, framework, pattern",
        etymology: "From Greek 'paradeigma' meaning 'pattern'", 
        scenario: "Remote work represents a paradigm shift in employment.",
        imagePrompt: "A geometric pattern or framework showing a structured model"
    },
    {
        word: "infrastructure", 
        pronunciation: "/ˈɪnfrəˌstrʌktʃər/", 
        definition: "basic physical systems of a country or organization",
        example: "Good infrastructure supports economic growth.", 
        synonyms: "foundation, framework, structure",
        etymology: "From Latin 'infra' meaning 'below' and 'structure'", 
        scenario: "The city invested heavily in digital infrastructure.",
        imagePrompt: "A network of roads, bridges, and communication towers"
    },
    {
        word: "allocate", 
        pronunciation: "/ˈæləˌkeɪt/", 
        definition: "distribute resources for a particular purpose",
        example: "We need to allocate more budget to marketing.", 
        synonyms: "assign, distribute, designate",
        etymology: "From Latin 'allocare' meaning 'to place'", 
        scenario: "The manager will allocate tasks based on expertise.",
        imagePrompt: "Pie chart showing different portions being distributed"
    },
    {
        word: "collaborate", 
        pronunciation: "/kəˈlæbəˌreɪt/", 
        definition: "work jointly on an activity or project",
        example: "Teams collaborate more effectively with good tools.", 
        synonyms: "cooperate, work together, partner",
        etymology: "From Latin 'collaborare' meaning 'to work together'", 
        scenario: "Scientists collaborate across borders on research.",
        imagePrompt: "Multiple people working together around a shared workspace"
    },
    {
        word: "optimize", 
        pronunciation: "/ˈɑːptɪˌmaɪz/", 
        definition: "make the best use of a situation or resource",
        example: "We need to optimize our supply chain efficiency.", 
        synonyms: "improve, enhance, perfect",
        etymology: "From Latin 'optimus' meaning 'best'", 
        scenario: "The algorithm optimizes route planning for delivery.",
        imagePrompt: "A smooth, efficient gear system working in perfect harmony"
    },
    {
        word: "facilitate", 
        pronunciation: "/fəˈsɪlɪˌteɪt/", 
        definition: "make an action or process easier",
        example: "Technology can facilitate remote learning.", 
        synonyms: "enable, assist, help",
        etymology: "From Latin 'facilis' meaning 'easy'", 
        scenario: "The new software facilitates project management.",
        imagePrompt: "A bridge connecting two sides, making crossing easier"
    },
    {
        word: "synthesize", 
        pronunciation: "/ˈsɪnθəˌsaɪz/", 
        definition: "combine elements to form a connected whole",
        example: "The report synthesizes data from multiple sources.", 
        synonyms: "combine, integrate, merge",
        etymology: "From Greek 'synthesis' meaning 'putting together'", 
        scenario: "Researchers synthesize findings into actionable insights.",
        imagePrompt: "Different colored streams flowing together into one river"
    },
    {
        word: "methodology", 
        pronunciation: "/ˌmeθəˈdɑːlədʒi/", 
        definition: "a system of methods used in a particular activity",
        example: "Our research methodology ensures accurate results.", 
        synonyms: "approach, system, procedure",
        etymology: "From Greek 'methodos' meaning 'way of inquiry'", 
        scenario: "The consulting firm's methodology is proven and reliable.",
        imagePrompt: "A flowchart showing systematic steps and processes"
    },
    {
        word: "benchmark", 
        pronunciation: "/ˈbentʃmɑːrk/", 
        definition: "a standard point of reference for comparison",
        example: "Industry benchmarks help measure performance.", 
        synonyms: "standard, reference point, criterion",
        etymology: "From surveying marks cut into stone benches", 
        scenario: "The company exceeded all benchmark targets this quarter.",
        imagePrompt: "A measuring ruler or gauge showing standards and comparisons"
    },
    {
        word: "analogy", 
        pronunciation: "/əˈnælədʒi/", 
        definition: "a comparison between things that have similar features",
        example: "He used a sports analogy to explain the strategy.", 
        synonyms: "comparison, similarity, parallel",
        etymology: "From Greek 'analogia' meaning 'proportion'", 
        scenario: "The teacher's analogy helped students understand the concept.",
        imagePrompt: "Two similar objects side by side showing their comparable features"
    },
    {
        word: "hypothesis", 
        pronunciation: "/haɪˈpɑːθəsɪs/", 
        definition: "a proposed explanation that can be tested",
        example: "The scientist tested her hypothesis through experiments.", 
        synonyms: "theory, proposition, assumption",
        etymology: "From Greek 'hypothesis' meaning 'foundation'", 
        scenario: "The hypothesis was supported by the experimental data.",
        imagePrompt: "A scientist looking at test tubes with a question mark above"
    },
    {
        word: "correlation", 
        pronunciation: "/ˌkɔːrəˈleɪʃən/", 
        definition: "a mutual relationship between two or more things",
        example: "There's a strong correlation between exercise and health.", 
        synonyms: "connection, relationship, link",
        etymology: "From Latin 'cor-' meaning 'together' and 'relatio'", 
        scenario: "The data shows correlation but not causation.",
        imagePrompt: "Two graphs showing synchronized patterns or trends"
    },
    {
        word: "empirical", 
        pronunciation: "/ɪmˈpɪrɪkəl/", 
        definition: "based on observation or experience rather than theory",
        example: "The conclusion is based on empirical evidence.", 
        synonyms: "observational, experimental, factual",
        etymology: "From Greek 'empeirikos' meaning 'experienced'", 
        scenario: "Empirical research provides the strongest support.",
        imagePrompt: "A researcher observing and recording real-world phenomena"
    },
    {
        word: "feasible", 
        pronunciation: "/ˈfiːzəbəl/", 
        definition: "possible to do easily or conveniently",
        example: "The project timeline seems feasible given our resources.", 
        synonyms: "possible, achievable, viable",
        etymology: "From French 'faisable' meaning 'doable'", 
        scenario: "The engineer confirmed the design is technically feasible.",
        imagePrompt: "A green checkmark on a planning document showing approval"
    },
    {
        word: "preliminary", 
        pronunciation: "/prɪˈlɪməˌneri/", 
        definition: "denoting an action preceding something more important",
        example: "These are just preliminary results.", 
        synonyms: "initial, preparatory, introductory",
        etymology: "From Latin 'prae' meaning 'before' and 'limen' meaning 'threshold'", 
        scenario: "The preliminary report shows promising trends.",
        imagePrompt: "The first step of a staircase leading to higher levels"
    },
    {
        word: "subsequent", 
        pronunciation: "/ˈsʌbsɪkwənt/", 
        definition: "coming after something in time; following",
        example: "Subsequent events proved her right.", 
        synonyms: "following, later, ensuing",
        etymology: "From Latin 'subsequi' meaning 'to follow closely'", 
        scenario: "Subsequent analysis revealed additional insights.",
        imagePrompt: "A timeline showing events following one after another"
    },
    {
        word: "fundamental", 
        pronunciation: "/ˌfʌndəˈmentəl/", 
        definition: "forming a necessary base or core; essential",
        example: "Understanding basics is fundamental to success.", 
        synonyms: "basic, essential, core",
        etymology: "From Latin 'fundamentum' meaning 'foundation'", 
        scenario: "These fundamental principles guide all decisions.",
        imagePrompt: "A strong foundation stone supporting a building structure"
    },
    {
        word: "criterion", 
        pronunciation: "/kraɪˈtɪriən/", 
        definition: "a principle or standard by which something is judged",
        example: "Experience is the main criterion for this position.", 
        synonyms: "standard, measure, benchmark",
        etymology: "From Greek 'kriterion' meaning 'means of judging'", 
        scenario: "The selection criteria are clearly defined.",
        imagePrompt: "A checklist with various standards and requirements marked"
    },
    {
        word: "constitute", 
        pronunciation: "/ˈkɑːnstɪˌtuːt/", 
        definition: "be a part of a whole; form or compose",
        example: "These factors constitute the main challenges.", 
        synonyms: "form, make up, comprise",
        etymology: "From Latin 'constituere' meaning 'to set up'", 
        scenario: "These elements constitute a complete solution.",
        imagePrompt: "Building blocks coming together to form a larger structure"
    },
    {
        word: "derive", 
        pronunciation: "/dɪˈraɪv/", 
        definition: "obtain something from a specified source",
        example: "The company derives most revenue from services.", 
        synonyms: "obtain, get, extract",
        etymology: "From Latin 'derivare' meaning 'to draw off'", 
        scenario: "Scientists derive energy from renewable sources.",
        imagePrompt: "Water flowing from a mountain spring to a river below"
    },
    {
        word: "implies", 
        pronunciation: "/ɪmˈplaɪz/", 
        definition: "strongly suggest the truth of something not explicitly stated",
        example: "His silence implies agreement with the proposal.", 
        synonyms: "suggests, indicates, hints",
        etymology: "From Latin 'implicare' meaning 'to involve'", 
        scenario: "The data implies a need for policy changes.",
        imagePrompt: "A shadow on the wall suggesting the shape of something unseen"
    },
    {
        word: "establish", 
        pronunciation: "/ɪˈstæblɪʃ/", 
        definition: "set up on a firm or permanent basis",
        example: "The company aims to establish market leadership.", 
        synonyms: "create, found, set up",
        etymology: "From Latin 'stabilire' meaning 'to make firm'", 
        scenario: "The research establishes a clear connection.",
        imagePrompt: "Foundation stones being laid for a permanent structure"
    },
    {
        word: "significant", 
        pronunciation: "/sɪɡˈnɪfɪkənt/", 
        definition: "sufficiently great or important to be worthy of attention",
        example: "The results show significant improvement.", 
        synonyms: "important, notable, considerable",
        etymology: "From Latin 'significare' meaning 'to indicate'", 
        scenario: "The merger will have significant market impact.",
        imagePrompt: "A large mountain peak standing prominently against the sky"
    },
    {
        word: "assess", 
        pronunciation: "/əˈses/", 
        definition: "evaluate or estimate the nature, ability, or quality",
        example: "We need to assess the project's viability.", 
        synonyms: "evaluate, appraise, judge",
        etymology: "From Latin 'assidere' meaning 'to sit beside'", 
        scenario: "The expert will assess the property's value.",
        imagePrompt: "A person with a clipboard carefully examining and rating items"
    }
];