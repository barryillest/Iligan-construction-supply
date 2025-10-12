import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiMapPin, FiClock } from 'react-icons/fi';

const AboutContainer = styled.div`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: 60px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  font-size: 20px;
  color: var(--text-secondary);
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const Section = styled.section`
  margin-bottom: 60px;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary);
`;

const SectionContent = styled.div`
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-secondary);
  max-width: 800px;
  margin: 0 auto;
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  margin-top: 40px;
`;

const ValueCard = styled(motion.div)`
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-color);
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
`;

const ValueIcon = styled.div`
  width: 48px;
  height: 48px;
  background: var(--accent-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
`;

const ValueTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
`;

const ValueDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 14px;
`;

const About = () => {
  const values = [
    {
      icon: <FiAward size={20} />,
      title: 'Quality First',
      description: 'We provide only the highest quality construction materials and tools from trusted manufacturers.'
    },
    {
      icon: <FiUsers size={20} />,
      title: 'Customer Focus',
      description: 'Our customers are at the heart of everything we do. We strive to exceed expectations every time.'
    },
    {
      icon: <FiMapPin size={20} />,
      title: 'Local Expertise',
      description: 'With deep roots in Iligan City, we understand the local construction needs and requirements.'
    },
    {
      icon: <FiClock size={20} />,
      title: 'Reliable Service',
      description: 'Count on us for timely deliveries and consistent availability of your essential construction supplies.'
    }
  ];

  return (
    <AboutContainer>
      <HeroSection>
        <Title>About Iligan Construction Supply</Title>
        <Subtitle>
          Building communities with quality materials and exceptional service since our founding.
        </Subtitle>
      </HeroSection>

      <Section>
        <SectionTitle>Our Story</SectionTitle>
        <SectionContent>
          <p>
            Iligan Construction Supply was founded with a simple mission: to provide the local construction
            industry with reliable access to high-quality materials, tools, and equipment. Located in the
            heart of Iligan City, we have grown from a small local supplier to a trusted partner for
            contractors, builders, and DIY enthusiasts throughout the region.
          </p>
          <br />
          <p>
            Our partnership with leading suppliers and integration with modern e-commerce platforms
            allows us to offer an extensive catalog of construction materials at competitive prices.
            From basic hand tools to heavy-duty equipment, we ensure that every product meets our
            strict quality standards.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Our Mission</SectionTitle>
        <SectionContent>
          <p>
            To empower construction professionals and homeowners with access to premium building
            materials and tools, supported by expert advice and reliable service. We believe that
            quality construction starts with quality materials, and we're committed to being your
            trusted partner in every project.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Our Values</SectionTitle>
        <ValuesGrid>
          {values.map((value, index) => (
            <ValueCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <ValueIcon>{value.icon}</ValueIcon>
              <ValueTitle>{value.title}</ValueTitle>
              <ValueDescription>{value.description}</ValueDescription>
            </ValueCard>
          ))}
        </ValuesGrid>
      </Section>

      <Section>
        <SectionTitle>Why Choose Us?</SectionTitle>
        <SectionContent>
          <p>
            <strong>Extensive Product Range:</strong> From basic hardware to specialized construction
            equipment, we stock everything you need for your projects.
          </p>
          <br />
          <p>
            <strong>Competitive Pricing:</strong> Our strategic partnerships allow us to offer
            competitive prices without compromising on quality.
          </p>
          <br />
          <p>
            <strong>Expert Support:</strong> Our knowledgeable team is always ready to help you
            find the right materials and provide technical guidance.
          </p>
          <br />
          <p>
            <strong>Secure Transactions:</strong> With integrated PayPal payments and secure
            checkout, your transactions are always protected.
          </p>
        </SectionContent>
      </Section>
    </AboutContainer>
  );
};

export default About;