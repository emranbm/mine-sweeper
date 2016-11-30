<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:template match="/">
        <div class="grid" id="grid">
            <xsl:for-each select="./grid/row">
                <xsl:for-each select="./col">
                    <xsl:choose>
                        <xsl:when test="./@mine">
                            <span data-value="mine" oncontextmenu="return false;"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <span oncontextmenu="return false;"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:for-each>
            </xsl:for-each>
        </div>
    </xsl:template>

</xsl:stylesheet>