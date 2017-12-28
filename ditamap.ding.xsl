<?xml version="1.0" encoding="UTF-8"?>

<!DOCTYPE xsl:stylesheet>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:saxon="http://icl.com/saxon">

  <xsl:output method="text" indent="no"/>

  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="*">
    <xsl:param name="indent" select="'  '"/>
    <xsl:param name="newindent" select="concat('  ',$indent)"/>
    <xsl:if test="self::topicref">
      <xsl:value-of select="$indent"/>
      <xsl:text>- </xsl:text>
      <xsl:value-of select="@href"/>
      <xsl:text>&#10;</xsl:text>
    </xsl:if>
    <xsl:apply-templates>
      <xsl:with-param name="indent" select="$newindent"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="text()"/>

</xsl:stylesheet>
