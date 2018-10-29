IN vec2 texCoord;
UNI sampler2D tex;

void main()
{
   vec4 col=vec4(0.0,0.0,0.0,1.0);

   #ifdef CHANNEL_R
       col.r=texture2D(tex,texCoord).r;
       #ifdef MONO
           col.g=col.b=col.r;
       #endif
   #endif

   #ifdef CHANNEL_G
       col.g=texture2D(tex,texCoord).g;
       #ifdef MONO
           col.r=col.b=col.g;
       #endif
   #endif

   #ifdef CHANNEL_B
       col.b=texture2D(tex,texCoord).b;
       #ifdef MONO
           col.g=col.r=col.b;
       #endif
   #endif

   outColor = col;
}