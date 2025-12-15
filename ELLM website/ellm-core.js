// ELLM - Efficient Language and Logic Model based on Prime Encoding
// Complete implementation

// Prime Calculator
class PrimeCalculator {
  constructor(maxSize = 1000) {
    this.primes = this.generatePrimes(maxSize);
    this.primeCache = new Map();
  }
  
  generatePrimes(max) {
    // Sieve of Eratosthenes
    const sieve = Array(max + 1).fill(true);
    sieve[0] = sieve[1] = false;
    
    for (let i = 2; i * i <= max; i++) {
      if (sieve[i]) {
        for (let j = i * i; j <= max; j += i) {
          sieve[j] = false;
        }
      }
    }
    
    return Array.from({ length: max + 1 }, (_, i) => i)
      .filter(i => sieve[i]);
  }
  
  isPrime(n) {
    if (this.primeCache.has(n)) return this.primeCache.get(n);
    
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    
    this.primeCache.set(n, true);
    return true;
  }
  
  factorize(n) {
    const factors = [];
    let remaining = n;
    
    for (const p of this.primes) {
      while (remaining % p === 0) {
        factors.push(p);
        remaining /= p;
      }
      if (p * p > remaining) break;
      if (remaining === 1) break;
    }
    
    if (remaining > 1) factors.push(remaining);
    return factors;
  }
  
  getNthPrime(n) {
    return this.primes[n] || this.generateNextPrime(this.primes[this.primes.length - 1]);
  }
  
  generateNextPrime(after) {
    let candidate = after + 1;
    while (!this.isPrime(candidate)) {
      candidate++;
    }
    return candidate;
  }
}

// Knowledge representation classes
class Fact {
  constructor(subject, predicate, object) {
    this.subject = String(subject).toLowerCase();
    this.predicate = String(predicate).toLowerCase();
    this.object = String(object).toLowerCase();
  }
  
  toString() {
    return `${this.subject} ${this.predicate} ${this.object}`;
  }
}

class Rule {
  constructor(conditions, conclusion) {
    this.conditions = Array.isArray(conditions) ? conditions : [conditions]; // Array of Facts
    this.conclusion = conclusion; // Fact
    this.type = "standard"; // Default rule type
  }
  
  // Special constructor for universal rules like "All X are Y"
  static createUniversalRule(category, property) {
    const variable = "_x_";
    const rule = new Rule(
      new Fact(variable, "is", category),
      new Fact(variable, "is", property)
    );
    rule.type = "universal";
    rule.category = category;
    rule.property = property;
    return rule;
  }
  
  // Special constructor for capability rules like "All X can Y"
  static createCapabilityRule(category, capability) {
    const variable = "_x_";
    const rule = new Rule(
      new Fact(variable, "is", category),
      new Fact(variable, "can", capability)
    );
    rule.type = "capability";
    rule.category = category;
    rule.capability = capability;
    return rule;
  }
  
  toString() {
    if (this.type === "universal") {
      return `All ${this.category} are ${this.property}`;
    }
    if (this.type === "capability") {
      return `All ${this.category} can ${this.capability}`;
    }
    if (this.conditions.length === 1) {
      return `IF (${this.conditions[0]}) THEN (${this.conclusion})`;
    }
    return `IF (${this.conditions.join(' AND ')}) THEN (${this.conclusion})`;
  }
}

// Concept Encoder
class ConceptEncoder {
  constructor() {
    this.primeCalc = new PrimeCalculator();
    this.conceptToPrime = new Map();
    this.primeToConceptCache = new Map();
    this.nextPrimeIndex = 0;
    
    // Special variable token for rules
    this.variablePrime = this.getPrime("_variable_");
  }
  
  getPrime(concept) {
    const normalizedConcept = String(concept).toLowerCase();
    if (this.conceptToPrime.has(normalizedConcept)) {
      return this.conceptToPrime.get(normalizedConcept);
    }
    
    // Assign next available prime
    const prime = this.primeCalc.getNthPrime(this.nextPrimeIndex++);
    this.conceptToPrime.set(normalizedConcept, prime);
    this.primeToConceptCache.set(prime, normalizedConcept);
    
    return prime;
  }
  
  getConceptName(prime) {
    return this.primeToConceptCache.get(prime) || `Unknown(${prime})`;
  }
  
  encodeFact(fact) {
    const subjectPrime = this.getPrime(fact.subject);
    const predicatePrime = this.getPrime(fact.predicate);
    const objectPrime = this.getPrime(fact.object);
    
    return subjectPrime * predicatePrime * objectPrime;
  }
  
  encodeRule(rule) {
    if (rule.type === "universal" || rule.type === "capability") {
      // For universal rules, we store the category and property
      return {
        type: rule.type,
        variablePrime: this.variablePrime,
        categoryPrime: this.getPrime(rule.category),
        propertyPrime: rule.type === "universal" ? this.getPrime(rule.property) : this.getPrime(rule.capability),
        predicatePrime: rule.type === "universal" ? this.getPrime("is") : this.getPrime("can"),
        conditionEncoding: this.encodeFact(rule.conditions[0]),
        conclusionEncoding: this.encodeFact(rule.conclusion)
      };
    }
    
    // For standard rules with multiple conditions
    const conditionEncodings = rule.conditions.map(cond => this.encodeFact(cond));
    
    return {
      type: "standard",
      conditionEncodings,
      conclusionEncoding: this.encodeFact(rule.conclusion)
    };
  }
  
  decodeFact(encoding) {
    const factors = this.primeCalc.factorize(encoding);
    
    if (factors.length === 3) {
      const [subjectPrime, predicatePrime, objectPrime] = factors;
      
      const subject = this.getConceptName(subjectPrime);
      const predicate = this.getConceptName(predicatePrime);
      const object = this.getConceptName(objectPrime);
      
      return new Fact(subject, predicate, object);
    }
    
    return null; // Not a valid fact encoding
  }
  
  getVariablePrime() {
    return this.variablePrime;
  }
}

// Knowledge Base
class KnowledgeBase {
  constructor(encoder) {
    this.encoder = encoder;
    this.factEncodings = [];
    this.rules = [];
    this.facts = []; // Original facts for reference
  }
  
  addFact(fact) {
    const encoding = this.encoder.encodeFact(fact);
    this.factEncodings.push(encoding);
    this.facts.push(fact);
    return encoding;
  }
  
  addRule(rule) {
    const encodedRule = this.encoder.encodeRule(rule);
    this.rules.push(encodedRule);
    return encodedRule;
  }
  
  getAllFactEncodings() {
    return this.factEncodings;
  }
  
  getAllRules() {
    return this.rules;
  }
  
  printKnowledgeBase() {
    console.log("Knowledge Base Contents:");
    console.log("Facts:");
    this.facts.forEach(fact => console.log(`- ${fact}`));
    
    console.log("Rules:");
    this.rules.forEach(rule => {
      if (rule.type === "universal") {
        console.log(`- All ${this.encoder.getConceptName(rule.categoryPrime)} are ${this.encoder.getConceptName(rule.propertyPrime)}`);
      } else if (rule.type === "capability") {
        console.log(`- All ${this.encoder.getConceptName(rule.categoryPrime)} can ${this.encoder.getConceptName(rule.propertyPrime)}`);
      } else {
        try {
          const conditions = rule.conditionEncodings.map(enc => this.encoder.decodeFact(enc));
          const conclusion = this.encoder.decodeFact(rule.conclusionEncoding);
          
          if (conditions.length === 1) {
            console.log(`- IF (${conditions[0]}) THEN (${conclusion})`);
          } else {
            console.log(`- IF (${conditions.join(' AND ')}) THEN (${conclusion})`);
          }
        } catch (err) {
          console.log("- [Rule with unparseable structure]");
        }
      }
    });
  }
}

// Reasoning Engine
class ReasoningEngine {
  constructor(encoder) {
    this.encoder = encoder;
    this.primeCalc = new PrimeCalculator();
    this.visited = new Set(); // Track visited queries to prevent infinite recursion
  }
  
  deduce(kb, queryFact) {
    // Reset visited set for each new top-level query
    this.visited = new Set();
    return this._deduce(kb, queryFact);
  }
  
  _deduce(kb, queryFact, depth = 0) {
    // Encode the query fact
    const queryEncoding = this.encoder.encodeFact(queryFact);
    
    // Check for recursion
    const queryKey = queryFact.toString();
    if (this.visited.has(queryKey)) {
      return { 
        result: false, 
        explanation: `Circular reasoning detected: ${queryFact}` 
      };
    }
    this.visited.add(queryKey);
    
    // Check if directly in KB
    if (kb.factEncodings.includes(queryEncoding)) {
      return { 
        result: true, 
        explanation: `Direct fact in knowledge base: ${queryFact}` 
      };
    }
    
    // Check all universal and capability rules
    for (const rule of kb.rules) {
      if (rule.type === "universal" || rule.type === "capability") {
        // If query predicate matches the rule's predicate (is/can)
        if (queryFact.predicate === this.encoder.getConceptName(rule.predicatePrime) && 
            queryFact.object === this.encoder.getConceptName(rule.propertyPrime)) {
          
          // Check if subject is of the right category
          const membershipFact = new Fact(
            queryFact.subject, 
            "is", 
            this.encoder.getConceptName(rule.categoryPrime)
          );
          
          const subResult = this._deduce(kb, membershipFact, depth + 1);
          if (subResult.result) {
            const ruleType = rule.type === "universal" ? "are" : "can";
            return { 
              result: true, 
              explanation: `${subResult.explanation}, and all ${this.encoder.getConceptName(rule.categoryPrime)} ${ruleType} ${this.encoder.getConceptName(rule.propertyPrime)}` 
            };
          }
        }
      }
    }
    // Check standard rules
    for (const rule of kb.rules) {
      if (rule.type === "standard") {
        // If the conclusion matches our query
        if (rule.conclusionEncoding === queryEncoding) {
          // All conditions must be satisfied
          let allConditionsMet = true;
          let explanations = [];
          
          for (const conditionEncoding of rule.conditionEncodings) {
            const conditionFact = this.encoder.decodeFact(conditionEncoding);
            if (!conditionFact) {
              allConditionsMet = false;
              break;
            }
            
            const conditionResult = this._deduce(kb, conditionFact, depth + 1);
            
            if (!conditionResult.result) {
              allConditionsMet = false;
              break;
            }
            
            explanations.push(conditionResult.explanation);
          }
          
          if (allConditionsMet) {
            return {
              result: true,
              explanation: `${explanations.join(', ')}, which implies ${queryFact}`
            };
          }
        }
      }
    }
    
    // Try to apply transitive reasoning for certain predicates
    if (["is", "part of"].includes(queryFact.predicate)) {
      const transitiveResult = this.tryTransitiveReasoning(kb, queryFact, depth);
      if (transitiveResult.result) {
        return transitiveResult;
      }
    }
    
    // No deduction path found
    return { 
      result: false, 
      explanation: `Could not deduce: ${queryFact}` 
    };
  }
  
  // Special case for transitive relations like "part of" or "is a"
  tryTransitiveReasoning(kb, queryFact, depth) {
    const { subject, predicate, object } = queryFact;
    
    // Look for intermediate concepts
    for (const fact of kb.facts) {
      if (fact.subject === subject && fact.predicate === predicate) {
        // Found a potential intermediate: subject predicate intermediate
        const intermediateFact = new Fact(fact.object, predicate, object);
        const result = this._deduce(kb, intermediateFact, depth + 1);
        
        if (result.result) {
          return {
            result: true,
            explanation: `${subject} ${predicate} ${fact.object}, and ${result.explanation}`
          };
        }
      }
    }
    
    return { result: false, explanation: "" };
  }
}

// Language Processor
class LanguageProcessor {
  constructor(encoder) {
    this.encoder = encoder;
  }
  
  parseFact(sentence) {
    // Clean and normalize the sentence
    const text = sentence.toLowerCase().replace(/[.?!,;]$/g, '').trim();
    
    // Handle "X is Y" statements
    if (text.includes(' is ')) {
      const parts = text.split(' is ');
      if (parts.length === 2) {
        const subject = parts[0].trim();
        const object = parts[1].trim();
        return new Fact(subject, "is", object);
      }
    }
    
    // Handle "X has Y" statements
    if (text.includes(' has ')) {
      const parts = text.split(' has ');
      if (parts.length === 2) {
        const subject = parts[0].trim();
        const object = parts[1].trim();
        return new Fact(subject, "has", object);
      }
    }
    
    // Handle "X can Y" statements
    if (text.includes(' can ')) {
      const parts = text.split(' can ');
      if (parts.length === 2) {
        const subject = parts[0].trim();
        const action = parts[1].trim();
        return new Fact(subject, "can", action);
      }
    }
    
    // Handle "X cannot Y" statements
    if (text.includes(' cannot ')) {
      const parts = text.split(' cannot ');
      if (parts.length === 2) {
        const subject = parts[0].trim();
        const action = parts[1].trim();
        // Encode as negative capability
        return new Fact(subject, "cannot", action);
      }
    }
    
    // Handle "X likes Y" statements
    if (text.includes(' likes ')) {
      const parts = text.split(' likes ');
      if (parts.length === 2) {
        const subject = parts[0].trim();
        const object = parts[1].trim();
        return new Fact(subject, "likes", object);
      }
    }
    
    // Handle "X teaches Y" statements
    if (text.includes(' teaches ')) {
      const parts = text.split(' teaches ');
      if (parts.length === 2) {
        const subject = parts[0].trim();
        const object = parts[1].trim();
        return new Fact(subject, "teaches", object);
      }
    }
    
    // Handle "X part of Y" statements
    if (text.includes(' part of ')) {
      const parts = text.split(' part of ');
      if (parts.length === 2) {
        const subject = parts[0].trim().replace('the ', '');
        const object = parts[1].trim().replace('the ', '');
        return new Fact(subject, "part of", object);
      }
    }
    
    return null; // Parsing failed
  }
  
  parseRule(sentence) {
    // Clean and normalize the sentence
    const text = sentence.toLowerCase().replace(/[.?!,;]$/g, '').trim();
    
    // Handle "All X are Y" rules
    if (text.startsWith('all ') && text.includes(' are ')) {
      const parts = text.replace('all ', '').split(' are ');
      if (parts.length === 2) {
        const category = parts[0].trim();
        const property = parts[1].trim();
        return Rule.createUniversalRule(category, property);
      }
    }
    
    // Handle "All X can Y" rules
    if (text.startsWith('all ') && text.includes(' can ')) {
      const parts = text.replace('all ', '').split(' can ');
      if (parts.length === 2) {
        const category = parts[0].trim();
        const capability = parts[1].trim();
        return Rule.createCapabilityRule(category, capability);
      }
    }
    
    // Handle explicit IF-THEN rules
    if ((text.startsWith('if ') && text.includes(' then ')) || 
        (text.startsWith('if ') && text.includes(', then '))) {
      let parts;
      if (text.includes(', then ')) {
        parts = text.replace('if ', '').split(', then ');
      } else {
        parts = text.replace('if ', '').split(' then ');
      }
      
      if (parts.length === 2) {
        const conditionText = parts[0].trim();
        const conclusionText = parts[1].trim();
        
        // Handle multiple conditions with AND
        let conditions = [];
        if (conditionText.includes(' and ')) {
          const conditionParts = conditionText.split(' and ');
          for (const part of conditionParts) {
            const condition = this.parseFact(part);
            if (condition) {
              conditions.push(condition);
            } else {
              return null; // Failed to parse condition
            }
          }
        } else {
          const condition = this.parseFact(conditionText);
          if (condition) {
            conditions.push(condition);
          } else {
            return null; // Failed to parse condition
          }
        }
        
        const conclusion = this.parseFact(conclusionText);
        if (conclusion) {
          return new Rule(conditions, conclusion);
        }
      }
    }
    
    return null; // Parsing failed
  }
  
  parseQuery(question) {
    // Clean and normalize the question
    const text = question.toLowerCase().replace(/[.?!,;]$/g, '').trim();
    
    // Handle "Is X Y?" questions
    if (text.startsWith('is ')) {
      const restOfQuery = text.substring(3).trim();
      if (restOfQuery.includes(' a ')) {
        // Handle "Is X a Y?" format
        const parts = restOfQuery.split(' a ');
        if (parts.length === 2) {
          const subject = parts[0].trim();
          const object = parts[1].trim();
          return new Fact(subject, "is", object);
        }
      } else if (restOfQuery.includes(' an ')) {
        // Handle "Is X an Y?" format
        const parts = restOfQuery.split(' an ');
        if (parts.length === 2) {
          const subject = parts[0].trim();
          const object = parts[1].trim();
          return new Fact(subject, "is", object);
        }
      } else if (restOfQuery.includes(' part of ')) {
        // Handle "Is X part of Y?" format
        const parts = restOfQuery.split(' part of ');
        if (parts.length === 2) {
          const subject = parts[0].trim();
          const object = parts[1].trim();
          return new Fact(subject, "part of", object);
        }
      } else {
        // General "Is X Y?" format
        const words = restOfQuery.split(' ');
        if (words.length >= 2) {
          const subject = words[0];
          const object = words.slice(1).join(' ');
          return new Fact(subject, "is", object);
        }
      }
    }
    
    // Handle "Are X Y?" questions (for plurals)
    if (text.startsWith('are ')) {
      const restOfQuery = text.substring(4).trim();
      const words = restOfQuery.split(' ');
      if (words.length >= 2) {
        const subject = words[0];
        const object = words.slice(1).join(' ');
        return new Fact(subject, "is", object);
      }
    }
    
    // Handle "Does X have Y?" questions
    if (text.startsWith('does ') && text.includes(' have ')) {
      const withoutDoes = text.substring(5).trim();
      const parts = withoutDoes.split(' have ');
      
      if (parts.length === 2) {
        const subject = parts[0];
        const object = parts[1];
        return new Fact(subject, "has", object);
      }
    }
    
    // Handle "Can X Y?" questions
    if (text.startsWith('can ')) {
      const restOfQuery = text.substring(4).trim();
      const words = restOfQuery.split(' ');
      if (words.length >= 2) {
        const subject = words[0];
        const action = words.slice(1).join(' ');
        return new Fact(subject, "can", action);
      }
    }
    
    // Handle "Does X like Y?" questions
    if (text.startsWith('does ') && text.includes(' like ')) {
      const withoutDoes = text.substring(5).trim();
      const parts = withoutDoes.split(' like ');
      
      if (parts.length === 2) {
        const subject = parts[0];
        const object = parts[1];
        return new Fact(subject, "likes", object);
      }
    }
    
    return null; // Parsing failed
  }
}

// Main ELLM class
class ELLM {
  constructor() {
    this.encoder = new ConceptEncoder();
    this.language = new LanguageProcessor(this.encoder);
    this.kb = new KnowledgeBase(this.encoder);
    this.reasoner = new ReasoningEngine(this.encoder);
  }
  
  learn(text) {
    // Split the text into sentences
    const sentences = text.split(/[.!?]\s*/).filter(s => s.trim().length > 0);
    let learningResults = [];
    
    for (const sentence of sentences) {
      if (!sentence.trim()) continue;
      
      // First try to parse as a rule
      const rule = this.language.parseRule(sentence);
      if (rule) {
        this.kb.addRule(rule);
        learningResults.push(`Added rule: ${rule}`);
        continue;
      }
      
      // Then try to parse as a fact
      const fact = this.language.parseFact(sentence);
      if (fact) {
        this.kb.addFact(fact);
        learningResults.push(`Added fact: ${fact}`);
        continue;
      }
      
      learningResults.push(`Failed to parse: "${sentence}"`);
    }
    
    return learningResults;
  }
  
  query(question) {
    const queryFact = this.language.parseQuery(question);
    
    if (queryFact) {
      const result = this.reasoner.deduce(this.kb, queryFact);
      
      return {
        query: question,
        parsedQuery: queryFact.toString(),
        answer: result.result ? "Yes" : "No",
        explanation: result.explanation
      };
    }
    
    return {
      query: question,
      parsedQuery: null,
      answer: "Unknown",
      explanation: "Could not parse the query"
    };
  }
  
  explainKnowledgeBase() {
    this.kb.printKnowledgeBase();
  }

  describeRule(rule) {
    if (rule.type === "universal") {
      return `All ${this.encoder.getConceptName(rule.categoryPrime)} are ${this.encoder.getConceptName(rule.propertyPrime)}`;
    }

    if (rule.type === "capability") {
      return `All ${this.encoder.getConceptName(rule.categoryPrime)} can ${this.encoder.getConceptName(rule.propertyPrime)}`;
    }

    if (rule.type === "standard") {
      const conditions = rule.conditionEncodings
        .map(enc => this.encoder.decodeFact(enc))
        .filter(Boolean)
        .map(cond => cond.toString());
      const conclusion = this.encoder.decodeFact(rule.conclusionEncoding);

      if (conditions.length && conclusion) {
        return conditions.length === 1
          ? `IF (${conditions[0]}) THEN (${conclusion})`
          : `IF (${conditions.join(' AND ')}) THEN (${conclusion})`;
      }
    }

    return "[Unrecognized rule]";
  }

  getKnowledgeSummary() {
    return {
      facts: this.kb.facts.map(f => f.toString()),
      rules: this.kb.rules.map(rule => this.describeRule(rule))
    };
  }

  reset() {
    this.encoder = new ConceptEncoder();
    this.language = new LanguageProcessor(this.encoder);
    this.kb = new KnowledgeBase(this.encoder);
    this.reasoner = new ReasoningEngine(this.encoder);
    return this;
  }
}
// Expose to browser environments
if (typeof window !== "undefined") {
  window.ELLM = ELLM;
  window.Rule = Rule;
  window.Fact = Fact;
}
